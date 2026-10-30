// e2e виджета Image Enhancer на /image-enhancer/ в headless Chromium (WebGPU нет → путь WASM, один поток).
// Запуск: BASE=http://localhost:<порт>/image-enhancer/ node tools/e2e_ie_tool.mjs  (нужна сеть: jsDelivr + модель с IONOS)
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8091/image-enhancer/';
const TMP = '/tmp/ie-e2e';
const SHOTS = new URL('../releases/ie-widget/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++; };

const browser = await chromium.launch({
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
});

async function makePng(name, w, h) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<div style="width:${w}px;height:${h}px;background:linear-gradient(45deg,#c33,#36c);font:bold ${Math.round(h / 4)}px Arial;color:#fff;display:flex;align-items:center;justify-content:center">IE</div>`);
  await p.screenshot({ path: `${TMP}/${name}.png` });
  await p.close();
}
await makePng('small', 160, 120);

async function openPage(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  return { page, errors };
}
const events = (page) => page.evaluate(() => window.__ev);
const settled = (page) => page.waitForSelector('#iew-done:not([hidden]), #iew-error:not([hidden])', { timeout: 300000 });

async function pngSize(path) {
  const b = fs.readFileSync(path);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

// 1. Enhance → тот же размер, затем Try 2x на той же картинке → вдвое больше
{
  const { page, errors } = await openPage();
  const t0 = Date.now();
  await page.setInputFiles('#iew-file', `${TMP}/small.png`);
  await settled(page);
  ok(await page.locator('#iew-done').isVisible(), `enhance: результат за ${((Date.now() - t0) / 1000).toFixed(1)} с (с первой загрузкой) — ${await page.textContent('#iew-meta')}`);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#iew-dl')]);
  const p1 = `${TMP}/out1.png`; await dl.saveAs(p1);
  const [w1, h1] = await pngSize(p1);
  ok(w1 === 160 && h1 === 120, `enhance: PNG ${w1}×${h1} (= исходник), имя ${dl.suggestedFilename()}`);
  await page.screenshot({ path: `${SHOTS}/desktop-done.png` });

  const t1 = Date.now();
  await page.click('.iew-rerun[data-mode="upscale2x"]');
  await page.waitForFunction(() => /Upscale 2x/.test(document.getElementById('iew-meta').textContent) && !document.getElementById('iew-done').hidden, null, { timeout: 300000 });
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#iew-dl')]);
  const p2 = `${TMP}/out2.png`; await dl2.saveAs(p2);
  const [w2, h2] = await pngSize(p2);
  ok(w2 === 320 && h2 === 240, `2x повторно без перезагрузки модели: ${w2}×${h2} за ${((Date.now() - t1) / 1000).toFixed(1)} с`);

  const ev = await events(page);
  const runs = ev.filter(([n]) => n === 'ie-run').map(([, d]) => d);
  ok(runs.length === 2 && runs.every((d) => d.result === 'ok'), `события ie-run: ${JSON.stringify(runs)}`);
  ok(ev.some(([n]) => n === 'ie-rerun') && ev.filter(([n]) => n === 'ie-download').length === 2, 'события rerun/download');
  const href = await page.getAttribute('#iew-done a.store-link', 'href');
  ok(/utm_content=ie-widget/.test(href) && /utm_source=devexthub_landing/.test(href), `ссылка в стор: ${href.split('?')[1]}`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 1б. Отмена посреди обработки: страница живая (движок в воркере), через секунды возвращается к выбору
{
  const { page, errors } = await openPage();
  await makePng('mid', 900, 700);
  await page.setInputFiles('#iew-file', `${TMP}/mid.png`);
  await page.waitForFunction(() => /%/.test(document.getElementById('iew-status').textContent) && /left/.test(document.getElementById('iew-status').textContent), null, { timeout: 300000 });
  const status = await page.textContent('#iew-status');
  const slow = await page.locator('#iew-slow').isVisible();
  const t0 = Date.now();
  await page.click('#iew-cancel', { timeout: 5000 });
  await page.waitForSelector('#iew-idle:not([hidden])', { timeout: 60000 });
  ok(true, `отмена сработала за ${((Date.now() - t0) / 1000).toFixed(1)} с; статус был «${status}», пометка о медленном пути: ${slow}`);
  ok((await events(page)).some(([n, d]) => n === 'ie-run' && d.result === 'cancel'), 'событие ie-run cancel');
  await page.setInputFiles('#iew-file', `${TMP}/small.png`);
  await settled(page);
  ok(await page.locator('#iew-done').isVisible(), 'после отмены новый запуск работает (новый воркер, модель из кэша)');
  ok(errors.length === 0, `отмена: без ошибок JS ${errors.join(' | ')}`);
}

// 2. Больше 4 МП → понятный отказ до запуска модели
{
  const { page } = await openPage();
  await makePng('big', 2600, 1800);
  await page.setInputFiles('#iew-file', `${TMP}/big.png`);
  await settled(page);
  ok(/4 MP/.test(await page.textContent('#iew-error-text')), `>4 МП: ${await page.textContent('#iew-error-text')}`);
}

// 3. Не картинка
{
  const { page } = await openPage();
  fs.writeFileSync(`${TMP}/notes.txt`, 'hello');
  await page.setInputFiles('#iew-file', `${TMP}/notes.txt`);
  await settled(page);
  ok(/JPG, PNG or WEBP/.test(await page.textContent('#iew-error-text')), 'txt → понятная ошибка');
}

// 4. Мобильный
{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS');
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK');
process.exit(fails ? 1 : 0);
