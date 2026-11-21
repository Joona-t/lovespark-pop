"""Tick scan per section of a master: high band (> 4 kHz) level and its swing within each beat.
Usage: .venv/bin/python tools/tickscan.py renders/<name>-master.wav patterns/<pattern>.strudel.js [--offset-bars N]
The sections come from the pattern's arrange() (length and the name before ':' in each row's comment), so the map
can never drift from the song (it once kept Aura's old 152-bar map and printed nan + "no tick" for a 24-bar preview).
A metronome-like click shows as a large swing (the old Aura ending: 45 dB at -22.8 dBFS)."""
import re, sys, subprocess, numpy as np
path, pattern = sys.argv[1], sys.argv[2]
off = float(sys.argv[sys.argv.index("--offset-bars") + 1]) if "--offset-bars" in sys.argv else 0.0
src = open(pattern).read(); body = src[src.rindex("arrange("):]
rows = [(m.group(1), (re.search(r"//\s*([^:(\n]+)", m.group(0)) or [None, None])[1]) for m in re.finditer(r"^\s*\[(\d+),[\s\S]*?(?=^\s*\[\d+,|^\)\s*$)", body, re.M)]
if not rows: sys.exit(f"tickscan: no arrange() rows found in {pattern}")
bpm = float(re.search(r"setcpm\((\d+(?:\.\d+)?)/4\)", src).group(1)); bar = 240 / bpm; sr = 44100
SECTIONS, a = [], off
for i, (n, name) in enumerate(rows):
    SECTIONS.append(((name or f"section {i + 1}").strip(), a, a + int(n))); a += int(n)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-af", "highpass=f=4000:p=2,highpass=f=4000:p=2", "-f", "f32le", "-"], capture_output=True).stdout
h = np.frombuffer(raw, np.float32).astype(np.float64)
fr = int(.005 * sr); env = np.sqrt((h[: len(h) // fr * fr].reshape(-1, fr) ** 2).mean(1)); beat = int(round(bar / 4 / .005))
if SECTIONS[-1][2] * bar > len(h) / sr + bar:
    sys.exit(f"tickscan: the arrangement is {SECTIONS[-1][2]:g} bars ({SECTIONS[-1][2] * bar:.1f} s) but {path} is {len(h) / sr:.1f} s: wrong pattern or a cut-off master")
worst = 0
for name, a, b in SECTIONS:
    e = env[int(a * bar / .005): int(b * bar / .005)]; m = e[: len(e) // beat * beat].reshape(-1, beat)
    swing = float(np.mean(20 * np.log10((m.max(1) + 1e-9) / (m.min(1) + 1e-9)))); lvl = 20 * np.log10(np.sqrt((e ** 2).mean()) + 1e-12)
    flag = "  <-- check" if swing > 30 and lvl > -30 else ""
    worst = max(worst, swing if lvl > -30 else 0)
    print(f"  {name[:22]:22s} bars {a:5.0f}-{b:<5.0f} >4 kHz {lvl:6.1f} dBFS   swing per beat {swing:5.1f} dB{flag}")
print(f"  verdict: {'TICK RISK' if worst > 30 else 'no metronome-like tick (no loud section swings over 30 dB)'}")
