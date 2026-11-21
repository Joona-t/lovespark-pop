"""Mix and master a track from the stems captured by the live page (/?stems=<name>&bars=<N>).

    .venv/bin/python tools/mix_live.py renders/<name>.f32 renders/<out-prefix> --bpm 128 --bars 152 --first-kick-bar 9

Input: raw 32-bit float, 12 channels at the page's sample rate: master 2, kick 1, drums 2, music 2, bass 1, bell 2, other 2
(other = orbits 5-8). Stops before mixing if the stems do not add up to the full mix (null test worse than -20 dB).
Same method as tools/mix.py (the club set): null test, bar 1 from the first kick, the balance as played with corrective
processing only, masters to a loudness target, every number printed and saved to <out-prefix>-mix-report.json.
"""
import argparse, json, re, subprocess, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("raw"); ap.add_argument("out")
ap.add_argument("--bpm", type=float, required=True); ap.add_argument("--bars", type=int, required=True)
ap.add_argument("--first-kick-bar", type=int, required=True, help="1-based bar of the first kick")
ap.add_argument("--music-hp", type=float, default=170, help="high-pass on the music bus in Hz; lower it for a low arp (Aura B: 80)")
ap.add_argument("--rate", type=int, default=44100); ap.add_argument("--tail-bars", type=float, default=1.5)
a = ap.parse_args()
LAY = {"master": (0, 2), "kick": (2, 1), "drums": (3, 2), "music": (5, 2), "bass": (7, 1), "bell": (8, 2), "other": (10, 2)}
RAW, OUT, SR, N, BAR = a.raw, a.out, a.rate, sum(c for _, c in LAY.values()), 240.0 / a.bpm
db = lambda v: -200.0 if v <= 0 else 20 * np.log10(v)

x = np.memmap(RAW, dtype="<f4", mode="r")
frames = len(x) // N
x = x[: frames * N].reshape(frames, N)
print(f"capture: {frames / SR:.2f} s, {N} channels")

# 1. null test and stem levels
peak = {k: 0.0 for k in LAY}; sq = {k: 0.0 for k in LAY}; res_sq = 0.0; sum_peak = 0.0
kick_on = None; kmax = float(np.abs(x[:, 2]).max())
for i in range(0, frames, 1 << 20):
    blk = np.asarray(x[i:i + (1 << 20)], dtype=np.float64)
    total = np.zeros((len(blk), 2))
    for k, (o, c) in LAY.items():
        s = blk[:, o:o + c]
        peak[k] = max(peak[k], float(np.abs(s).max())); sq[k] += float((s ** 2).sum()) / c
        if k != "master":
            total += s if c == 2 else np.repeat(s, 2, axis=1)
    res_sq += float(((blk[:, 0:2] - total) ** 2).sum()) / 2; sum_peak = max(sum_peak, float(np.abs(total).max()))
    if kick_on is None:
        hit = np.nonzero(np.abs(blk[:, 2]) > 0.1 * kmax)[0]
        if len(hit):
            kick_on = i + int(hit[0])
print("stem        peak dBFS   RMS dBFS")
for k in LAY:
    print(f"  {k:8s} {db(peak[k]):9.1f} {db(np.sqrt(sq[k] / frames)):10.1f}")
null_db = db(np.sqrt(res_sq / frames)) - db(np.sqrt(sq["master"] / frames))
print(f"null test: stems minus full mix = {null_db:.1f} dB relative to the mix")
print(f"full mix as played: peak {db(peak['master']):+.1f} dBFS  ->  {'CLIPS at the output' if peak['master'] > 1 else 'no clipping'}")

if null_db > -20:
    sys.exit(f"null test {null_db:.1f} dB: the stems do not add up to the mix, a bus is not captured; nothing mixed")
if kick_on is None:
    sys.exit("the kick stem is silent: a voice is missing from the capture (BUG-014), nothing mixed")
for k in LAY:
    if peak[k] <= 0 and k != "other":            # other is empty when a track uses only orbits 1-4 and 9
        sys.exit(f"the {k} stem is silent: a voice is missing from the capture (BUG-014), nothing mixed")

# 2. bar 1 from the first kick, and the kick gate (a throttled page drops hits, BUG-013)
t0 = kick_on / SR - (a.first_kick_bar - 1) * BAR
dur = (a.bars + a.tail_bars) * BAR
kabs = np.abs(np.asarray(x[:, 2], dtype=np.float64)); kicks = []
for b in range(a.bars):
    seg = kabs[max(0, int((t0 + b * BAR) * SR)): int((t0 + (b + 1) * BAR) * SR)]
    kicks.append(int(sum(seg[int(i * len(seg) / 4): int(i * len(seg) / 4) + int(.08 * SR)].max() > 0.2 * kmax for i in range(4))) if len(seg) else 0)
print("kicks per bar:", "".join(str(k) for k in kicks))
print(f"first kick at {kick_on / SR:.3f} s -> bar 1 at {t0:.3f} s; master length {dur:.2f} s")
if t0 < 0:
    sys.exit("bar 1 falls before the start of the capture")
if frames / SR < t0 + dur - 0.05:
    sys.exit(f"capture too short: {frames / SR:.2f} s, need {t0 + dur:.2f} s")

# 3. the mix: the balance as played, corrective processing only
pre = -8.0 - db(sum_peak)
def st(name, chain):
    o, c = LAY[name]
    return f"[s_{name}]pan=stereo|c0=c{o}|c1=c{o + (1 if c == 2 else 0)},volume={pre:.2f}dB,{chain}[{name}]"
graph = ";".join([
    f"[0:a]asplit={len(LAY) - 1}" + "".join(f"[s_{k}]" for k in LAY if k != "master"),
    st("kick", "highpass=f=28"),
    st("drums", "highpass=f=250"),
    # drum chain: kick and tops through one compressor so they move together, then gentle saturation
    "[kick][drums]amix=inputs=2:normalize=0,acompressor=threshold=-16dB:ratio=2.5:attack=15:release=120:knee=4:makeup=1.6,asoftclip=type=tanh:threshold=0.75[drumbus]",
    st("bass", "highpass=f=30,lowpass=f=5000"),
    st("music", f"highpass=f={a.music_hp:g}"),         # pluck and glass: 170 Hz keeps them above the bass; a low arp needs less
    st("bell", "highpass=f=300"),
    st("other", "highpass=f=120"),                   # pads and vocals on orbits 5-8
    "[drumbus][bass][music][bell][other]amix=inputs=5:normalize=0,"
    "acompressor=threshold=-15dB:ratio=1.5:attack=30:release=220:knee=6:makeup=1,"
    f"afade=t=in:st=0:d=0.01,afade=t=out:st={a.bars * BAR:.2f}:d={a.tail_bars * BAR:.2f}:curve=qsin[mix]",   # only the delay tail fades
])
src = ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(N), "-ss", f"{t0:.4f}", "-t", f"{dur:.3f}", "-i", RAW]
premix = OUT + "-premaster.wav"
subprocess.run(src + ["-filter_complex", graph, "-map", "[mix]", "-c:a", "pcm_f32le", premix], check=True)
subprocess.run(src + ["-af", "pan=stereo|c0=c0|c1=c1", "-c:a", "pcm_f32le", OUT + "-asplayed.wav"], check=True)

def measure(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = e[e.rindex("Summary:"):]
    g = lambda pat: float(re.search(pat, tail).group(1))
    s = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "astats=metadata=0:measure_perchannel=none:measure_overall=Peak_level+Flat_factor", "-f", "null", "-"], capture_output=True, text=True).stderr
    def h(key):
        f = re.findall(key + r": ([-\d.inf]+)", s)
        return float(f[-1]) if f else float("nan")
    return {"LUFS": g(r"I:\s+([-\d.]+) LUFS"), "LRA": g(r"LRA:\s+([-\d.]+) LU"), "true_peak_dB": g(r"Peak:\s+([-\d.]+) dBFS"),
            "sample_peak_dB": h("Peak level dB"), "flat_factor": h("Flat factor")}

# 4. masters: gain to the target, limiter, measure, correct
report = {"capture_seconds": round(frames / SR, 2), "null_test_dB": round(null_db, 1), "bar1_at_s": round(t0, 4), "kicks_per_bar": kicks,
          "as_played": measure(OUT + "-asplayed.wav"), "premaster": measure(premix), "stems_dBFS": {k: round(db(peak[k]), 1) for k in LAY}}
for tag, target, limit in (("master-14", -14.0, -1.6), ("master-loud-10", -10.0, -2.4)):   # the limiter is not true-peak, so it gets a margin
    gain = target - report["premaster"]["LUFS"]
    for _ in range(3):
        out = f"{OUT}-{tag}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", premix, "-af",
                        f"volume={gain:.2f}dB,alimiter=limit={limit}dB:level=false:attack=4:release=60:asc=true,aresample=48000:filter_size=64:cutoff=0.97",
                        "-c:a", "pcm_s24le", out], check=True)
        m = measure(out)
        if abs(m["LUFS"] - target) <= 0.25:
            break
        gain += target - m["LUFS"]
    report[tag] = m
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-c:a", "libmp3lame", "-b:a", "320k", f"{OUT}-{tag}.mp3"], check=True)
json.dump(report, open(OUT + "-mix-report.json", "w"), indent=1)
for k in ("as_played", "premaster", "master-14", "master-loud-10"):
    m = report[k]
    print(f"{k:14s} {m['LUFS']:6.1f} LUFS  LRA {m['LRA']:4.1f}  true peak {m['true_peak_dB']:+5.1f} dBTP  sample peak {m['sample_peak_dB']:+5.1f} dBFS  flat factor {m['flat_factor']:.1f}")
