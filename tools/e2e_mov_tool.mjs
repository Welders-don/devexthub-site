// e2e виджета MOV ↔ MP4 на /convert-mov-to-mp4/ в headless Chromium.
// Запуск: node tools/e2e_mov_tool.mjs  (сайт на http://localhost:8095)
// Ограничение стенда: headless-сборка не кодирует H.264, поэтому HEVC здесь идёт путём fallback
// (копия), транскод проверяется только живьём в обычном Chrome. Ветка >150 МБ (на диск) не покрыта.
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8095/convert-mov-to-mp4/';
const V = '/home/client/projects/Convertmovtomp4/test-videos';
const SHOTS = new URL('../releases/mov-widget/', import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++; };

const browser = await chromium.launch({
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
});

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
const settled = (page) => page.waitForSelector('#mvt-done:not([hidden]), #mvt-error:not([hidden]), #mvt-big:not([hidden])', { timeout: 180000 });

async function convertOne(file, wantExt) {
  const { page, errors } = await openPage();
  const dl = page.waitForEvent('download', { timeout: 180000 }).catch(() => null);
  await page.setInputFiles('#mvt-file', `${V}/${file}`);
  await settled(page);
  const d = await dl;
  const done = await page.locator('#mvt-done').isVisible();
  const ev = (await events(page)).filter(([n]) => n === 'mov-run').map(([, x]) => x);
  let head = '';
  if (d) head = fs.readFileSync(await d.path()).subarray(4, 8).toString('latin1');
  ok(done && d && d.suggestedFilename().endsWith(wantExt) && head === 'ftyp',
    `${file} → ${d ? d.suggestedFilename() : 'нет файла'} (${head}) ${JSON.stringify(ev)}`);
  ok(errors.length === 0, `${file}: без ошибок JS ${errors.join(' | ')}`);
  return page;
}

// 1-3. H.264 MOV → MP4, MP4 → MOV, HEVC MOV (на стенде fallback)
const p1 = await convertOne('IMG_1001_h264.mov', '.mp4');
await p1.screenshot({ path: `${SHOTS}/desktop-done.png` });
const ev1 = (await events(p1)).find(([n]) => n === 'mov-run')[1];
ok(ev1.path === 'remux' && ev1.result === 'ok', 'H.264 MOV идёт мгновенным remux');
const href = await p1.getAttribute('#mvt-done a.store-link', 'href');
ok(/utm_content=mov-widget/.test(href) && /utm_source=devexthub_landing/.test(href), `ссылка в стор: ${href}`);
await convertOne('sample_h264.mp4', '.mov');
await convertOne('IMG_1002_hevc.mov', '.mp4');

// 4. «broken.MOV» = обрезанный айфонный MOV со звуком APAC: видео живое, звук браузер не читает →
// файл отдаём с жёлтым предупреждением, как расширение (не ошибка).
{
  const { page } = await openPage();
  await page.setInputFiles('#mvt-file', `${V}/broken.MOV`);
  await settled(page);
  ok(await page.locator('#mvt-done').isVisible() && /without sound/.test(await page.textContent('#mvt-warn')),
    `broken.MOV (APAC) → готово с предупреждением: ${await page.textContent('#mvt-warn')}`);
  ok((await events(page)).some(([n, d]) => n === 'mov-run' && d.result === 'warn'), 'событие mov-run warn');
}

// 5. Картинка → понятная ошибка
for (const [file, re] of [['not-a-video.jpg', /isn't a video/]]) {
  const { page } = await openPage();
  await page.setInputFiles('#mvt-file', `${V}/${file}`);
  await settled(page);
  ok(re.test(await page.textContent('#mvt-error-text')), `${file} → ${await page.textContent('#mvt-error-text')}`);
}

// 6. Две штуки разом → берём первый и говорим про расширение
{
  const { page } = await openPage();
  const files = ['IMG_1001_h264.mov', 'sample_h264.mp4'].map((f) => ({ name: f, b64: fs.readFileSync(`${V}/${f}`).toString('base64') }));
  const dl = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate((fs_) => {
    const dt = new DataTransfer();
    for (const f of fs_) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: 'video/quicktime' }));
    document.getElementById('mvt-drop').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, files);
  await settled(page);
  const d = await dl;
  ok(await page.locator('#mvt-multi').isVisible() && d && d.suggestedFilename() === 'IMG_1001_h264.mp4', 'пачка → первый файл + подсказка про расширение');
  ok((await events(page)).some(([n, x]) => n === 'mov-multi' && x.n === 2), 'событие mov-multi');
}

// 7. Мобильный
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
