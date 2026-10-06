const { chromium } = require('/home/client/projects/JobAgent/node_modules/playwright');
const fs = require('fs'), path = require('path');
const SITE = '/home/client/projects/Devexthub-site';
(async () => {
  const b = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
  for (const [slug, w] of [['can-chatgpt-transcribe-a-video', 1280], ['how-to-copy-text-from-an-image-on-pc', 1280], ['can-chatgpt-transcribe-a-video', 390], ['how-to-copy-text-from-an-image-on-pc', 390]]) {
    const page = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.route('https://www.devexthub.com/**', (r) => { const p = new URL(r.request().url()).pathname; const f = path.join(SITE, p.endsWith('/') ? p + 'index.html' : p); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); const t = f.endsWith('.css') ? 'text/css' : f.endsWith('.webp') ? 'image/webp' : 'text/html'; r.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': t } }); });
    await page.route(/api\.devexthub\.com/, (r) => r.fulfill({ status: 200, body: '' }));
    await page.goto(`https://www.devexthub.com/blog/${slug}/`);
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    const imgs = await page.$$eval('article img', (a) => a.map((i) => [i.getAttribute('src'), i.naturalWidth, Math.round(i.getBoundingClientRect().width)]));
    for (const i of await page.$$('article img')) { await i.scrollIntoViewIfNeeded(); }
    await page.waitForTimeout(500);
    const imgs2 = await page.$$eval('article img', (a) => a.map((i) => [i.getAttribute('src').split('/').pop(), i.naturalWidth, Math.round(i.getBoundingClientRect().width)]));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(slug, w, JSON.stringify(imgs2), 'overflowX', overflow, errs.join(';'));
    await page.screenshot({ path: `${__dirname}/render-${slug.slice(0, 12)}-${w}.png`, fullPage: true });
  }
  await b.close();
})();
