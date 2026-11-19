"""Mix and master the set from its stems (captured by the club page with ?stems=<name>).

    .venv/bin/python tools/mix.py renders/<name>.f32 renders/<out-prefix>

Input: raw 32-bit float, 18 channels at 44.1 kHz: master 2, kick 1, drums 2, bass 1, music 2, lead 2, chops 2, far 2, line 2, mc 2.
What it does, and prints the numbers for:
  1. null test: the stems must add up to the captured full mix (otherwise a layer is missing from the stems)
  2. finds bar 1 from the first kick (bar 29), so the master starts exactly on the downbeat for the video
  3. mixes at the balance that was played (every stem at the same gain), with corrective processing only:
     low cuts so only kick and bass own the low end, kick + drums through one bus compressor and soft saturation
     (the drum chain), steadier vocals, a light glue compressor on the whole mix
  4. masters to a loudness target with a limiter (the live sum was hard-clipping instead), then measures the result
"""
import json, re, subprocess, sys
import numpy as np

RAW, OUT = sys.argv[1], sys.argv[2]
SR, N, BPM, BARS, FIRST_KICK_BAR = 44100, 18, 126, 104, 8
BAR = 240.0 / BPM
LAY = {"master": (0, 2), "kick": (2, 1), "drums": (3, 2), "bass": (5, 1), "music": (6, 2), "lead": (8, 2),
       "chops": (10, 2), "far": (12, 2), "line": (14, 2), "mc": (16, 2)}
db = lambda v: -200.0 if v <= 0 else 20 * np.log10(v)

x = np.memmap(RAW, dtype="<f4", mode="r")
frames = len(x) // N
x = x[: frames * N].reshape(frames, N)
print(f"capture: {frames / SR:.2f} s, {N} channels")

# 1. null test and stem levels, in pieces to keep memory small
peak = {k: 0.0 for k in LAY}; sq = {k: 0.0 for k in LAY}; res_sq = 0.0; res_peak = 0.0; sum_peak = 0.0
kick_on = None; kmax = float(np.abs(x[:, 2]).max())
for i in range(0, frames, 1 << 20):
    blk = np.asarray(x[i:i + (1 << 20)], dtype=np.float64)
    total = np.zeros((len(blk), 2))
    for k, (o, c) in LAY.items():
        a = blk[:, o:o + c]
        peak[k] = max(peak[k], float(np.abs(a).max())); sq[k] += float((a ** 2).sum()) / c
        if k != "master":
            total += a if c == 2 else np.repeat(a, 2, axis=1)
    r = blk[:, 0:2] - total
    res_sq += float((r ** 2).sum()) / 2; res_peak = max(res_peak, float(np.abs(r).max())); sum_peak = max(sum_peak, float(np.abs(total).max()))
    if kick_on is None:
        hit = np.nonzero(np.abs(blk[:, 2]) > 0.1 * kmax)[0]
        if len(hit):
            kick_on = i + int(hit[0])
print("stem        peak dBFS   RMS dBFS")
for k in LAY:
    print(f"  {k:8s} {db(peak[k]):9.1f} {db(np.sqrt(sq[k] / frames)):10.1f}")
null_db = db(np.sqrt(res_sq / frames)) - db(np.sqrt(sq["master"] / frames))
print(f"null test: stems minus full mix = {null_db:.1f} dB relative to the mix (residual peak {db(res_peak):.1f} dBFS)")
print(f"full mix as played: peak {db(peak['master']):+.1f} dBFS  ->  {'CLIPS at the output' if peak['master'] > 1 else 'no clipping'}")

# 2. bar 1
t0 = kick_on / SR - FIRST_KICK_BAR * BAR
dur = BARS * BAR + 2.5
print(f"first kick at {kick_on / SR:.3f} s -> bar 1 at {t0:.3f} s; master length {dur:.2f} s")
if t0 < 0:
    sys.exit("bar 1 falls before the start of the capture")

# 3. the mix
pre = -8.0 - db(sum_peak)                              # one gain for every stem: the played balance, with headroom for the processing
def st(name, chain):
    o, c = LAY[name]
    pan = f"pan=stereo|c0=c{o}|c1=c{o + (1 if c == 2 else 0)}"
    return f"[s_{name}]{pan},volume={pre:.2f}dB,{chain}[{name}]"
graph = ";".join([
    "[0:a]asplit=9" + "".join(f"[s_{k}]" for k in LAY if k != "master"),
    st("kick", "highpass=f=28"),
    st("drums", "highpass=f=170"),
    # the drum chain: kick and the rest of the kit through one compressor (they move together), then gentle saturation
    "[kick][drums]amix=inputs=2:normalize=0,acompressor=threshold=-16dB:ratio=2.5:attack=15:release=120:knee=4:makeup=1.6,asoftclip=type=tanh:threshold=0.75[drumbus]",
    st("bass", "highpass=f=32,lowpass=f=5500"),
    st("music", "highpass=f=150"),
    st("lead", "highpass=f=220"),
    st("chops", "highpass=f=300"),
    st("far", "highpass=f=200"),
    st("line", "highpass=f=130,acompressor=threshold=-24dB:ratio=2.5:attack=10:release=150:makeup=1.4"),
    st("mc", "highpass=f=90,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=1.5"),
    "[drumbus][bass][music][lead][chops][far][line][mc]amix=inputs=8:normalize=0,"
    "acompressor=threshold=-15dB:ratio=1.5:attack=30:release=220:knee=6:makeup=1,"
    f"afade=t=in:st=0:d=0.02,afade=t=out:st={dur - 1.2:.2f}:d=1.2[mix]",
])
src = ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(N), "-ss", f"{t0:.4f}", "-t", f"{dur:.3f}", "-i", RAW]
premix = OUT + "-premaster.wav"
subprocess.run(src + ["-filter_complex", graph, "-map", "[mix]", "-c:a", "pcm_f32le", premix], check=True)
subprocess.run(src + ["-af", "pan=stereo|c0=c0|c1=c1", "-c:a", "pcm_f32le", OUT + "-asplayed.wav"], check=True)

def measure(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = e[e.rindex("Summary:"):]
    g = lambda pat: float(re.search(pat, tail).group(1))
    a = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "astats=metadata=0:measure_perchannel=none:measure_overall=Peak_level+Flat_factor", "-f", "null", "-"], capture_output=True, text=True).stderr
    def h(key):
        f = re.findall(key + r": ([-\d.inf]+)", a)
        return float(f[-1]) if f else float("nan")
    return {"LUFS": g(r"I:\s+([-\d.]+) LUFS"), "LRA": g(r"LRA:\s+([-\d.]+) LU"), "true_peak_dB": g(r"Peak:\s+([-\d.]+) dBFS"),
            "sample_peak_dB": h("Peak level dB"), "flat_factor": h("Flat factor")}

# 4. masters: gain to the target, limiter, measure, correct once
report = {"capture_seconds": round(frames / SR, 2), "null_test_dB": round(null_db, 1), "bar1_at_s": round(t0, 4),
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
