"""Spectrum of a master for a visualiser page: 32 log-spaced bands, 30 frames a second, one byte per band.

    .venv/bin/python tools/viz/analyze.py renders/slow-light-master-14.wav tools/viz/slow-light-spectrum.json

The page reads this file instead of analysing the audio live, so a frame-by-frame video render shows exactly what the
live page shows. Levels are in dB over a 48 dB window below the loudest band, with a +3 dB per octave tilt so the top
of the spectrum is visible; fast attack, slow release (0.78 per frame).
"""
import base64, json, subprocess, sys
import numpy as np

SRC, OUT, SR, FPS, BANDS, WIN = sys.argv[1], sys.argv[2], 48000, 30, 32, 4096
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
hop, n = SR // FPS, int(np.ceil(len(x) / (SR / FPS)))
x = np.concatenate([np.zeros(WIN // 2), x, np.zeros(WIN + hop)])
edges = np.geomspace(40, 14000, BANDS + 1); freqs = np.fft.rfftfreq(WIN, 1 / SR); win = np.hanning(WIN)
out = np.zeros((n, BANDS))
for i in range(n):
    mag = np.abs(np.fft.rfft(x[i * hop: i * hop + WIN] * win)) ** 2
    for k in range(BANDS):
        sel = (freqs >= edges[k]) & (freqs < edges[k + 1])
        out[i, k] = mag[sel].sum() if sel.any() else mag[np.argmin(np.abs(freqs - edges[k]))]
db = 10 * np.log10(out + 1e-12) + 3 * np.log2(np.sqrt(edges[:-1] * edges[1:]) / 40)
v = np.clip((db - (db.max() - 48)) / 48, 0, 1)
for i in range(1, n):
    v[i] = np.maximum(v[i], v[i - 1] * 0.78)
json.dump({"fps": FPS, "bands": BANDS, "frames": n, "data": base64.b64encode((v * 255).astype(np.uint8).tobytes()).decode()}, open(OUT, "w"))
print(f"{n} frames x {BANDS} bands -> {OUT}; mean level by quarter of the track:", [round(float(q.mean()), 2) for q in np.array_split(v, 4)])
print("mean of the top 8 bands by eighth of the track (the filter opening):", [round(float(q[:, -8:].mean()), 2) for q in np.array_split(v, 8)])
