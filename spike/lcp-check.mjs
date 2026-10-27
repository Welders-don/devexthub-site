// LCP и видимость hero сразу после загрузки (с JS, без reduced-motion)
import { createRequire } from 'node:module';
const require = createRequire(process.env.HOME + '/.claude/skills/hallmark/noop.js');
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: process.env.HOME + '/.claude/skills/hallmark/chrome-nosandbox.sh', headless: true });
for (const url of process.argv.slice(2)) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => { window.__lcp = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = { t: Math.round(e.startTime), el: e.element ? e.element.tagName + '.' + e.element.className : '' }; }).observe({ type: 'largest-contentful-paint', buffered: true }); });
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  const op0 = await p.evaluate(() => getComputedStyle(document.querySelector('.hero-band, .hero')).opacity);
  await new Promise(r => setTimeout(r, 2500));
  console.log(url.replace(/.*devexthub-site[^/]*\/|https:\/\/www\.devexthub\.com\//i, '/'), 'hero opacity at DCL:', op0, 'LCP:', JSON.stringify(await p.evaluate(() => window.__lcp)));
  await p.close();
}
await b.close();
