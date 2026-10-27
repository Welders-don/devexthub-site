import { createRequire } from 'node:module';
const require = createRequire(process.env.HOME + '/.claude/skills/hallmark/noop.js');
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: process.env.HOME + '/.claude/skills/hallmark/chrome-nosandbox.sh', headless: true });
const p = await b.newPage();
for (const w of [761, 768, 900, 1000]) {
  await p.setViewport({ width: w, height: 900 });
  await p.goto(process.argv[2], { waitUntil: 'networkidle0' });
  await p.addStyleTag({ content: '.nav a{white-space:nowrap} @media (max-width:1023px){.nav a{margin-left:12px;font-size:14px}}' });
  console.log(w, await p.evaluate(() => { const n = document.querySelector('.site-head .nav'), h = document.querySelector('.headrow'); return { navRight: Math.round(n.getBoundingClientRect().right), headrowRight: Math.round(h.getBoundingClientRect().right), docW: document.documentElement.scrollWidth, need: n.scrollWidth }; }));
}
await b.close();
