// e2e страницы /scan-qr-code-from-image/. QR рисует qrcode-generator (jsDelivr) в тестовом браузере.
// Запуск: BASE=http://localhost:<порт>/scan-qr-code-from-image/ node tools/e2e_qr_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const BASE = process.env.BASE || 'http://localhost:8086/scan-qr-code-from-image/';
const TMP = '/tmp/qr-e2e';
const SHOTS = new URL('../releases/qr-page/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });

const URL1 = 'https://www.devexthub.com/pdf-to-text/?utm=qr-test';
async function render(name, html, vp) {
  const p = await browser.newPage({ viewport: vp });
  await p.setContent(`<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><body style="margin:0">${html}</body>`);
  await p.waitForFunction(() => window.qrcode);
  await p.evaluate(() => document.querySelectorAll('[data-qr]').forEach((el) => {
    const q = window.qrcode(0, 'M'); q.addData(el.dataset.qr); q.make();
    el.innerHTML = q.createSvgTag({ cellSize: Number(el.dataset.cell || 6), margin: 4 });
  }));
  await p.screenshot({ path: `${TMP}/${name}.png` }); await p.close();
}
await render('plain', `<div data-qr="${URL1}" data-cell="8"></div>`, { width: 360, height: 360 });
await render('shot', `<div style="font:16px Arial;padding:20px;width:760px">Meeting tomorrow, scan to join the call:<br><br><div data-qr="WIFI:T:WPA;S:Office;P:secret123;;" data-cell="3" style="display:inline-block"></div><p>Thanks!</p></div>`, { width: 800, height: 400 });
await render('inverted', `<div data-qr="Hello from a QR code" data-cell="7" style="filter:invert(1);display:inline-block"></div>`, { width: 300, height: 300 });
await render('photo', `<div style="background:#ddd;padding:60px;width:600px;height:600px"><div data-qr="${URL1}" data-cell="7" style="transform:rotate(8deg);display:inline-block;filter:blur(0.6px)"></div></div>`, { width: 720, height: 720 });
await render('noqr', `<div style="font:28px Arial;padding:30px">Just text, no code here</div>`, { width: 600, height: 200 });
fs.writeFileSync(`${TMP}/notes.txt`, 'hello');

async function openPage(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE); return { page, errors };
}
const settled = (p) => p.waitForSelector('#qr-done:not([hidden]), #qr-none:not([hidden]), #qr-error:not([hidden])', { timeout: 30000 });

for (const [f, want, label] of [['plain', URL1, 'чистый QR со ссылкой'], ['shot', 'WIFI:T:WPA;S:Office;P:secret123;;', 'мелкий QR внутри скриншота'], ['inverted', 'Hello from a QR code', 'инвертированный'], ['photo', URL1, 'повёрнутый и размытый, как на фото']]) {
  const { page, errors } = await openPage();
  await page.setInputFiles('#qr-file', `${TMP}/${f}.png`); await settled(page);
  const got = await page.inputValue('#qr-text').catch(() => '');
  ok(got === want, `${label}: «${got}»`);
  if (f === 'plain') {
    ok(await page.locator('#qr-open').isVisible() && (await page.getAttribute('#qr-open', 'href')) === URL1 && /devexthub\.com/.test(await page.textContent('#qr-open')), `ссылка показана с доменом: ${await page.textContent('#qr-open')}`);
    await page.click('#qr-copy');
    ok((await page.evaluate(() => navigator.clipboard.readText())) === URL1, 'Copy = содержимое');
    await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
  }
  if (f === 'inverted') ok(!(await page.locator('#qr-open').isVisible()), 'текст без кнопки «Open»');
  ok(errors.length === 0, `${label}: без ошибок JS ${errors.join(' | ')}`);
}
{ const { page } = await openPage(); await page.setInputFiles('#qr-file', `${TMP}/noqr.png`); await settled(page);
  ok(await page.locator('#qr-none').isVisible(), 'картинка без QR → «No QR code found»'); }
{ const { page } = await openPage(); await page.setInputFiles('#qr-file', `${TMP}/notes.txt`); await settled(page);
  ok(await page.locator('#qr-error').isVisible(), 'txt → понятная ошибка');
  const ev = await page.evaluate(() => window.__ev); ok(ev.some(([n, d]) => n === 'qr-scan' && d.result === 'not-image'), 'событие qr-scan not-image'); }
{ const { page, errors } = await openPage({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS'); }
await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
