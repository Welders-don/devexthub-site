// Проверка правок a11y главной: меню на 768-1024, контраст hero на 1280, reveal без JS, фокус.
import { createRequire } from 'node:module';
const require = createRequire(process.env.HOME + '/.claude/skills/hallmark/noop.js');
const puppeteer = require('puppeteer-core');
const url = process.argv[2];
const b = await puppeteer.launch({ executablePath: process.env.HOME + '/.claude/skills/hallmark/chrome-nosandbox.sh', headless: true });
const p = await b.newPage();
for (const w of [768, 820, 900, 1024, 1280, 1440]) {
  await p.setViewport({ width: w, height: 900 });
  await p.goto(url, { waitUntil: 'networkidle0' });
  const r = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.site-head .nav a')].filter(a => a.offsetParent);
    const wrapped = links.filter(a => a.getClientRects().length > 1 || a.offsetHeight > 30).map(a => a.textContent.trim());
    const head = document.querySelector('.site-head');
    return { visible: links.length, wrapped, headH: head.offsetHeight, docW: document.documentElement.scrollWidth };
  });
  console.log(w, JSON.stringify(r));
}
await b.close();
// без JS: видимость .reveal; с JS: кольцо фокуса по Tab
const b2 = await puppeteer.launch({ executablePath: process.env.HOME + '/.claude/skills/hallmark/chrome-nosandbox.sh', headless: true });
const q = await b2.newPage(); await q.setViewport({ width: 1440, height: 900 });
await q.setJavaScriptEnabled(false); await q.goto(url, { waitUntil: 'networkidle0' });
console.log('noJS reveal opacity:', await q.evaluate(() => [...document.querySelectorAll('.reveal')].map(e => getComputedStyle(e).opacity).join(',')));
const q2 = await b2.newPage(); await q2.setViewport({ width: 1440, height: 900 });
await q2.goto(url, { waitUntil: 'networkidle0' }); await q2.keyboard.press('Tab'); await q2.keyboard.press('Tab');
console.log('focus:', await q2.evaluate(() => { const a = document.activeElement, s = getComputedStyle(a); return a.textContent.trim() + ' | ' + s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor; }));
await b2.close();
