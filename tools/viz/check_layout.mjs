#!/usr/bin/env node
// Layout check for a visualiser page: runs the page's own viz.check() (flower heads against each other, the sun's halo,
// the frame and the title, at every eighth of a bar) in headless Chromium and exits 1 with the list if anything touches.
//   node tools/viz/check_layout.mjs slow-light [--base http://127.0.0.1:4321] [--chrome path]
// Proven on a real defect (2026-11-20): with the sun's reach at 80 + 90 L it reported flower 3 touching the halo from bar 84.
import { chromium } from 'playwright-core';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const br = await chromium.launch({ headless: true, executablePath: arg('chrome') });
const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.goto(`${arg('base', 'http://127.0.0.1:4321')}/viz/${process.argv[2]}.html?bar=0`);
await pg.waitForFunction(() => window.viz && window.viz.ready, null, { timeout: 60000 });
const bad = await pg.evaluate(() => window.viz.check());
await br.close();
console.log(bad.length ? `LAYOUT: ${bad.length} problem(s)\n` + bad.join('\n') : 'LAYOUT: clean');
process.exit(bad.length ? 1 : 0);
