#!/usr/bin/env node
// Render a visualiser page (tools/viz/<name>.html) to video, frame-exact on the music's bar clock.
// The page draws every frame as a pure function of the bar position (window.viz.shot(bar)), so several processes can
// each take a range of frames and the parts join without a seam. Canvas 2D only: no GPU needed.
//   node render_viz.mjs --page slow-light --frames 0:8640 --out part0.mp4 [--fps 30] [--base http://127.0.0.1:4321] [--chrome path] [--ffmpeg path]
// Total frames = ceil((BARS + TAIL) * 240 / BPM * fps); the page reports BPM, BARS and TAIL.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const fps = +arg('fps', 30), out = arg('out'), base = arg('base', 'http://127.0.0.1:4321');
const br = await chromium.launch({ headless: true, executablePath: arg('chrome') });
const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
await pg.goto(`${base}/viz/${arg('page')}.html?bar=0`);
await pg.waitForFunction(() => window.viz && window.viz.ready, null, { timeout: 60000 });
const { BPM, BARS, TAIL } = await pg.evaluate(() => ({ BPM: window.viz.BPM, BARS: window.viz.BARS, TAIL: window.viz.TAIL }));
const total = Math.ceil((BARS + TAIL) * 240 / BPM * fps);
if (!arg('frames')) { console.log(`total frames at ${fps} fps: ${total}`); await br.close(); process.exit(0); }
const [f0, f1] = arg('frames').split(':').map(Number);
const ff = spawn(arg('ffmpeg', 'ffmpeg'), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', arg('crf', '14'), '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((s) => ff.on('close', s));
const t0 = Date.now();
for (let i = f0; i < Math.min(f1, total); i++) {
  const url = await pg.evaluate((b) => window.viz.shot(b, .95), i / fps * BPM / 240);
  if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise((s) => ff.stdin.once('drain', s));
  if ((i - f0) % 150 === 0) console.log(`frame ${i} (${i - f0 + 1}/${f1 - f0}) ${((i - f0 + 1) / ((Date.now() - t0) / 1000 + 1e-3)).toFixed(1)} fps`);
}
ff.stdin.end(); const rc = await done; await br.close();
console.log(`DONE ${out} frames ${f0}:${f1} in ${Math.round((Date.now() - t0) / 1000)} s rc=${rc}`);
process.exit(rc);
