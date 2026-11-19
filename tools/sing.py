"""Hard-tune spoken fragments into sung notes (WORLD vocoder): pitch onto notes, lift formants, stretch to beats.

    .venv/bin/python tools/sing.py work_sing samples/sing --bpm 126

Each entry of LINE: output name, source take, notes (split evenly over the fragment), length in beats.
Prints, per file, the measured pitch of the result against the target (cents off), so the tuning is checked, not assumed.
"""
import argparse, json
from pathlib import Path
import numpy as np, soundfile as sf, pyworld as pw

NOTE = {n: i for i, n in enumerate(["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"])}
def hz(name):  # "ab4" -> Hz
    return 440.0 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)

# "I've been waiting for this ... for such a long time / ... for all of my life" in F minor over Fm9 | Db^7 | Ab^7 | Eb
LINE = [
    ("sing_ivebeen",  "ive_been__s7",   ["ab4"],        1),
    ("sing_waiting",  "waiting__s33",   ["c5", "bb4"],  1),
    ("sing_forthis",  "for_this__s7",   ["ab4", "c5"],  2),
    ("sing_forsucha", "for_such_a__s7", ["c5", "bb4", "ab4"], 2),
    ("sing_long",     "long__s7",       ["c5"],         2),
    ("sing_time",     "time__s7",       ["bb4"],        3),
    ("sing_forallof", "for_all_of__s7", ["c5", "bb4", "c5"], 2),
    ("sing_my",       "my__s33",        ["eb5"],        2),
    ("sing_life",     "life__s21",      ["f5", "eb5"],  3),
]
FP = 5.0          # frame period, ms
KEEP = 0.12       # how much of the natural pitch movement survives (0 = robot, 1 = speech)
FORMANT = 1.12    # formant lift (hyperpop brightness)


def trim(x, sr):
    n = int(.01 * sr)
    rms = np.array([np.sqrt((x[i:i + n] ** 2).mean()) for i in range(0, len(x) - n, n)])
    on = np.where(rms > .06 * rms.max())[0]
    return x[max(0, on[0] * n - n): min(len(x), (on[-1] + 2) * n)]


def tune(x, sr, notes, seconds=None, keep=KEEP, formant=FORMANT):
    """seconds=None keeps the take's own length (no stretching: stretched consonants sound watery)."""
    f0, t = pw.harvest(x, sr, frame_period=FP, f0_floor=90, f0_ceil=450)
    sp, ap = pw.cheaptrick(x, f0, t, sr), pw.d4c(x, f0, t, sr)
    n_out = len(f0) if seconds is None else max(2, int(round(seconds * 1000 / FP)))
    idx = np.clip(np.round(np.linspace(0, len(f0) - 1, n_out)).astype(int), 0, len(f0) - 1)
    f0, sp, ap = f0[idx], sp[idx], ap[idx]
    voiced = f0 > 0
    med = np.median(f0[voiced])
    vpos = np.cumsum(voiced) / max(1, voiced.sum())                      # 0..1 through the voiced part
    target = np.array([hz(notes[min(len(notes) - 1, int(p * len(notes)))]) for p in vpos])
    k = int(40 / FP)                                                     # 40 ms glide between notes
    target = np.exp(np.convolve(np.log(target), np.ones(k) / k, mode="same")) if len(notes) > 1 else target
    seg = np.minimum(len(notes) - 1, (vpos * len(notes)).astype(int))    # which note each frame belongs to
    for i in range(len(notes)):                                          # natural movement is kept around each note's own centre
        m = voiced & (seg == i)
        if m.any():
            f0[m] = f0[m] / np.median(f0[m]) * med
    f0 = np.where(voiced, target * (f0 / med) ** keep, 0.0)
    bins = np.arange(sp.shape[1])
    src = np.clip(bins / formant, 0, sp.shape[1] - 1)
    sp = np.stack([np.interp(src, bins, row) for row in sp])
    y = pw.synthesize(f0, sp, ap, sr, frame_period=FP)
    fade = int(.008 * sr)
    y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
    return y / np.abs(y).max() * 0.7, seg, voiced


def cents_off(y, sr, seg, voiced, notes):
    """Pitch of the result against each target note, measured on the frames that were given that note."""
    f0y, _ = pw.harvest(y, sr, frame_period=FP, f0_floor=200, f0_ceil=1000)
    n = min(len(f0y), len(seg)); f0y, sg, vc = f0y[:n], seg[:n], voiced[:n]
    edge = np.zeros(n, bool)                     # skip 40 ms each side of a note change (the glide)
    for c in np.where(np.diff(sg) != 0)[0]:
        edge[max(0, c - 8): c + 9] = True
    cents = []
    for i, nt in enumerate(notes):                   # measured on the frames that were given this note
        m = vc & (sg == i) & ~edge & (f0y > 0)
        cents.append(round(float(1200 * np.log2(np.median(f0y[m]) / hz(nt))), 1) if m.sum() >= 4 else None)
    return cents


def measure(y, sr):
    f0, _ = pw.harvest(y, sr, frame_period=FP, f0_floor=150, f0_ceil=1000)
    return f0[f0 > 0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--bpm", type=float, default=126)
    ap.add_argument("--notes", help="one-file mode: tune SRC wav to these comma-separated notes, written to OUT wav, no stretching")
    ap.add_argument("--keep", type=float, default=KEEP); ap.add_argument("--formant", type=float, default=FORMANT)
    a = ap.parse_args()
    if a.notes:
        notes = a.notes.split(",")
        x, sr = sf.read(a.src)
        x = trim(np.ascontiguousarray(x if x.ndim == 1 else x.mean(1), dtype=np.float64), sr)
        y, seg, voiced = tune(x, sr, notes, None, a.keep, a.formant)
        Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        sf.write(a.out, y.astype(np.float32), sr)
        print(f"{Path(a.out).name:34s} {len(y)/sr:5.2f}s  cents off: {cents_off(y, sr, seg, voiced, notes)}")
        return
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    beat = 60 / a.bpm
    report = {}
    for name, take, notes, beats in LINE:
        x, sr = sf.read(Path(a.src) / f"{take}.wav")
        x = trim(np.ascontiguousarray(x if x.ndim == 1 else x.mean(1), dtype=np.float64), sr)
        y, seg, voiced = tune(x, sr, notes, beats * beat * 0.96)         # a hair short of the grid so notes don't smear
        sf.write(out / f"{name}.wav", y.astype(np.float32), sr)
        cents = cents_off(y, sr, seg, voiced, notes)
        report[name] = {"take": take, "notes": notes, "beats": beats, "seconds": round(len(y) / sr, 3), "cents_off": cents}
        print(f"{name:15s} {'-'.join(notes):12s} {len(y)/sr:5.2f}s  cents off: {cents}")
    (out / "tuning.json").write_text(json.dumps(report, indent=1) + "\n")


if __name__ == "__main__":
    main()
