#!/usr/bin/env node
// One still from a visualiser page as a PNG, at any scale (cover art: --scale 2.7778 --cover, then crop the middle square).
//   node tools/viz/still.mjs slow-light --bar 126.02 --scale 2.7778 --cover --out renders/still.png [--chrome path]
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const br = await chromium.launch({ headless: true, executablePath: arg('chrome') });
const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.goto(`${arg('base', 'http://127.0.0.1:4321')}/viz/${process.argv[2]}.html?bar=${arg('bar', '0')}&scale=${arg('scale', '1')}${process.argv.includes('--cover') ? '&cover' : ''}`);
await pg.waitForFunction(() => window.viz && window.viz.ready, null, { timeout: 60000 });
await pg.waitForTimeout(300);
const url = await pg.evaluate(() => document.getElementById('cv').toDataURL('image/png'));
writeFileSync(arg('out'), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
await br.close(); console.log('wrote', arg('out'));
