"""Tick scan per section (usage: .venv/bin/python tools/tickscan.py renders/<name>-master.wav; sections are Aura's bar map) of a master: high band (> 4 kHz) level and its swing within each beat.
A metronome-like click shows as a large swing (the old Aura ending: 45 dB at -22.8 dBFS)."""
import sys, subprocess, numpy as np
path = sys.argv[1]; bar = 240 / 128; sr = 44100
SECTIONS = [("air", 0, 16), ("bloom", 16, 32), ("pulse", 32, 48), ("groove", 48, 64), ("full", 64, 80), ("breakdown", 80, 96),
            ("build", 96, 104), ("drop", 104, 120), ("drop II", 120, 136), ("outro", 136, 152)]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-af", "highpass=f=4000:p=2,highpass=f=4000:p=2", "-f", "f32le", "-"], capture_output=True).stdout
h = np.frombuffer(raw, np.float32).astype(np.float64)
fr = int(.005 * sr); env = np.sqrt((h[: len(h) // fr * fr].reshape(-1, fr) ** 2).mean(1)); beat = int(round(bar / 4 / .005))
worst = 0
for name, a, b in SECTIONS:
    e = env[int(a * bar / .005): int(b * bar / .005)]; m = e[: len(e) // beat * beat].reshape(-1, beat)
    swing = float(np.mean(20 * np.log10((m.max(1) + 1e-9) / (m.min(1) + 1e-9)))); lvl = 20 * np.log10(np.sqrt((e ** 2).mean()) + 1e-12)
    flag = "  <-- check" if swing > 30 and lvl > -30 else ""
    worst = max(worst, swing if lvl > -30 else 0)
    print(f"  {name:10s} >4 kHz {lvl:6.1f} dBFS   swing per beat {swing:5.1f} dB{flag}")
print(f"  verdict: {'TICK RISK' if worst > 30 else 'no metronome-like tick (no loud section swings over 30 dB)'}")
