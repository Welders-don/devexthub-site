// e2e виджета OCR на /extract-text-from-image/ в headless Chromium.
// Запуск: node tools/e2e_ocr_tool.mjs  (сайт должен отдаваться по http://localhost:8099)
// Нужна сеть: движок tesseract.js и языки качаются с jsDelivr.
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8099/extract-text-from-image/';
const TMP = '/tmp/ocr-e2e';
const SHOTS = new URL('../releases/ocr-widget/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++; };

const browser = await chromium.launch({
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
});

async function textPng(name, html) {
  const p = await browser.newPage({ viewport: { width: 640, height: 220 } });
  await p.setContent(`<div style="font:28px Arial,sans-serif;padding:24px;line-height:1.5">${html}</div>`);
  await p.screenshot({ path: `${TMP}/${name}.png` });
  await p.close();
}
await textPng('en', 'Invoice 2043 due April 12<br>Total amount 1,488.00');
await textPng('ru', 'Счёт к оплате до пятницы<br>Итого рублей');
fs.writeFileSync(`${TMP}/notes.pdf`, '%PDF-1.4 not an image');

async function openPage(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true, locale: 'en-US' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  return { page, errors };
}
const visible = (page, id) => page.locator(`#${id}`).isVisible();
const events = (page) => page.evaluate(() => window.__ev);

// 1. Файл → текст, копирование, .txt
{
  const { page, errors } = await openPage();
  const t0 = Date.now();
  await page.setInputFiles('#oxt-file', `${TMP}/en.png`);
  await page.waitForSelector('#oxt-done:not([hidden]), #oxt-error:not([hidden]), #oxt-empty:not([hidden])', { timeout: 120000 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const text = await page.inputValue('#oxt-text');
  ok(/Invoice/.test(text) && /1,488/.test(text), `en: текст распознан за ${secs} с: ${JSON.stringify(text)}`);
  await page.screenshot({ path: `${SHOTS}/desktop-done.png`, fullPage: false });

  await page.click('#oxt-copy');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip === text, 'Copy all кладёт текст в буфер');

  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#oxt-txt')]);
  ok(dl.suggestedFilename() === 'en.txt', `имя .txt: ${dl.suggestedFilename()}`);
  ok(fs.readFileSync(await dl.path(), 'utf8') === text, '.txt совпадает с текстом');

  const href = await page.getAttribute('#oxt-done a.store-link', 'href');
  ok(/utm_content=ocr-widget/.test(href) && /utm_source=devexthub_landing/.test(href), `ссылка в стор: ${href}`);

  const ev = await events(page);
  ok(ev.some(([n, d]) => n === 'ocr-run' && d.result === 'ok' && d.lang === 'eng'), 'событие ocr-run ok');
  ok(ev.some(([n]) => n === 'ocr-copy') && ev.some(([n]) => n === 'ocr-download'), 'события copy/download');

  // 2. Смена языка перечитывает ту же картинку (воркер переинициализируется)
  await page.setInputFiles('#oxt-file', `${TMP}/ru.png`);
  await page.waitForSelector('#oxt-done:not([hidden]), #oxt-empty:not([hidden])', { timeout: 120000 });
  await page.selectOption('#oxt-lang', 'rus');
  await page.waitForFunction(() => window.__ev.some(([n, d]) => n === 'ocr-run' && d.lang === 'rus'), null, { timeout: 120000 });
  const ru = await page.inputValue('#oxt-text');
  ok(/Итого/.test(ru), `ru после смены языка: ${JSON.stringify(ru)}`);
  ok(errors.length === 0, `без ошибок JS: ${errors.join(' | ')}`);
}

// 3. Вставка Ctrl+V
{
  const { page } = await openPage();
  const b64 = fs.readFileSync(`${TMP}/en.png`).toString('base64');
  await page.evaluate((b) => {
    const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bin], 'shot.png', { type: 'image/png' }));
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt }));
  }, b64);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  const ev = await events(page);
  ok(ev.some(([n, d]) => n === 'ocr-pick' && d.via === 'paste'), 'paste → ocr-pick via paste → результат');
}

// 4. Не картинка
{
  const { page } = await openPage();
  await page.setInputFiles('#oxt-file', `${TMP}/notes.pdf`);
  ok(await visible(page, 'oxt-error'), 'PDF → понятная ошибка');
  ok((await events(page)).some(([n, d]) => n === 'ocr-run' && d.result === 'not-image'), 'событие not-image');
}

// 5. Мобильный: виджет виден, ничего не вылезает по ширине
{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  ok(!overflow, 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS');
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK');
process.exit(fails ? 1 : 0);
