#!/usr/bin/env node
// Render the club stage to video, frame-exact on the music's bar clock.
// Opens the club page in headless Chromium, switches it to offline mode (its own loop stops) and, for each video frame,
// asks for one frame at the exact bar position of that time: bar = t * 126 / 240 (the master starts on bar 1's downbeat).
// JPEG frames are piped into ffmpeg. Several processes can each take a range of frames (one per GPU); each warms up for
// WARM frames before its range so hair and cloth physics have settled at the join.
//   node render_video.mjs --frames 0:3810 --out part0.mp4 [--fps 30] [--size 1920x1080] [--gl angle-vulkan] [--ffmpeg path]
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const BPM = 126, BARS = 132, WARM = 90;
const [f0, f1] = arg('frames').split(':').map(Number), fps = +arg('fps', 30), [w, h] = arg('size', '1920x1080').split('x').map(Number);
const out = arg('out'), base = arg('base', 'http://127.0.0.1:4321'), gl = arg('gl', 'angle-vulkan');
const barAt = (i) => Math.min(i / fps * BPM / 240, BARS - 1e-3);
const GL = { 'angle-vulkan': ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu'],
  egl: ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu'],
  swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }[gl];

const br = await chromium.launch({ headless: true, args: GL, executablePath: arg('chrome') });
const pg = await br.newPage({ viewport: { width: w, height: h } });
pg.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
await pg.goto(`${base}/club?bar=0&hold`);
await pg.waitForFunction(() => window.club && window.club.ready, null, { timeout: 60000 });
let r; const tEnd = Date.now() + 180000;
for (;;) {
  r = await pg.evaluate(() => window.club.ready());
  if (r.ash && r.mc && r.claudios === 7 && r.moves >= 2 && r.dancers > 0) break;
  if (Date.now() > tEnd) { console.error('models not ready', r); process.exit(2); }
  await new Promise((s) => setTimeout(s, 1000));
}
const renderer = await pg.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
console.log('renderer:', renderer, 'ready:', JSON.stringify(r));
await pg.evaluate(([W, H]) => window.club.offline(W, H), [w, h]);
const warm = async (b) => pg.evaluate(([b, d]) => { window.club.shot(b, d, .1); }, [b, 1 / fps]);
if (f0 === 0) for (let i = 0; i < WARM; i++) await warm(0);
else for (let i = Math.max(0, f0 - WARM); i < f0; i++) await warm(barAt(i));

const ff = spawn(arg('ffmpeg', 'ffmpeg'), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', arg('crf', '16'), '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((s) => ff.on('close', s));
const t0 = Date.now();
for (let i = f0; i < f1; i++) {
  const url = await pg.evaluate(([b, d]) => window.club.shot(b, d), [barAt(i), 1 / fps]);
  if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise((s) => ff.stdin.once('drain', s));
  if ((i - f0) % 150 === 0) console.log(`frame ${i} (${i - f0 + 1}/${f1 - f0}) ${((i - f0 + 1) / ((Date.now() - t0) / 1000 + 1e-3)).toFixed(1)} fps`);
}
ff.stdin.end(); const rc = await done; await br.close();
console.log(`DONE ${out} frames ${f0}:${f1} in ${Math.round((Date.now() - t0) / 1000)} s rc=${rc}`);
process.exit(rc);
