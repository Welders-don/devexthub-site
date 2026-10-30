// e2e /brighten-image/ и /change-image-color/ (canvas, без сети). Запуск: SITE=http://localhost:<порт> node tools/e2e_color_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const SITE = process.env.SITE || 'http://localhost:8088';
const TMP = '/home/client/workspace/tmp/clr-e2e'; const SHOTS = new URL('../releases/color-tools/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
async function png(html, w, h, name) { const p = await browser.newPage({ viewport: { width: w, height: h } }); await p.setContent(`<body style="margin:0">${html}</body>`); await p.screenshot({ path: `${TMP}/${name}` }); await p.close(); }
await png('<div style="width:1600px;height:1000px;background:linear-gradient(90deg,#050505,#3a3020)"><div style="font:120px Arial;color:#2a2a2a;padding:200px">dark</div></div>', 1600, 1000, 'dark.png');
await png('<div style="width:1000px;height:700px;background:#fff;position:relative"><div style="position:absolute;left:300px;top:200px;width:400px;height:300px;background:linear-gradient(#e53935,#7f1d1d)"></div></div>', 1000, 700, 'red.png');
async function open(path, viewport = { width: 1280, height: 1000 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE + path); return { page, errors };
}
const canvasPx = (page, fx, fy) => page.evaluate(([fx, fy]) => { const c = document.getElementById('clr-canvas'); return [...c.getContext('2d').getImageData(Math.floor(c.width * fx), Math.floor(c.height * fy), 1, 1).data].slice(0, 3); }, [fx, fy]);
const canvasMean = (page) => page.evaluate(() => { const c = document.getElementById('clr-canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; });
// Готовый файл раскодируем в браузере: размер и пиксель.
const fileInfo = (page, file, fx, fy) => page.evaluate(async ([b64, fx, fy]) => {
  const bm = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
  const c = new OffscreenCanvas(bm.width, bm.height); const x = c.getContext('2d'); x.drawImage(bm, 0, 0);
  const d = x.getImageData(0, 0, bm.width, bm.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2];
  const i = (Math.floor(bm.height * fy) * bm.width + Math.floor(bm.width * fx)) * 4;
  return { w: bm.width, h: bm.height, mean: s / (d.length / 4) / 3, px: [d[i], d[i + 1], d[i + 2]] };
}, [fs.readFileSync(file).toString('base64'), fx, fy]);
async function download(page) { const [d] = await Promise.all([page.waitForEvent('download'), page.click('#clr-dl')]); const p = `${TMP}/${d.suggestedFilename()}`; await d.saveAs(p); return { p, name: d.suggestedFilename() }; }
{
  const { page, errors } = await open('/brighten-image/');
  await page.setInputFiles('#clr-file', `${TMP}/dark.png`);
  await page.waitForSelector('#clr-opts:not([hidden])');
  await page.waitForTimeout(200);
  const m1 = await canvasMean(page);
  await page.dispatchEvent('#clr-compare', 'pointerdown');
  const m0 = await canvasMean(page);
  await page.dispatchEvent('#clr-compare', 'pointerup'); await page.waitForTimeout(100);
  ok(m1 > m0 * 2, `яркость превью: исходник ${m0.toFixed(1)} → ${m1.toFixed(1)} (Auto + 35)`);
  await page.fill('#clr-b', '80'); await page.dispatchEvent('#clr-b', 'input'); await page.waitForTimeout(200);
  const m2 = await canvasMean(page);
  ok(m2 > m1, `ползунок яркости 80: ${m2.toFixed(1)}`);
  const f = await download(page); const info = await fileInfo(page, f.p, 0.5, 0.5);
  ok(info.w === 1600 && info.h === 1000 && info.mean > m0 * 2 && f.name === 'dark-brightened.png', `файл ${f.name} ${info.w}×${info.h}, средняя ${info.mean.toFixed(1)}`);
  ok((await page.evaluate(() => window.__ev)).some(([n, d]) => n === 'clr-download' && d.kind === 'brighten' && d.b === 80), 'событие clr-download brighten');
  await page.screenshot({ path: `${SHOTS}/brighten-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
{
  const { page, errors } = await open('/change-image-color/');
  await page.setInputFiles('#clr-file', `${TMP}/red.png`);
  await page.waitForSelector('#clr-opts:not([hidden])');
  ok(/Click the color/.test(await page.textContent('#clr-hint')), 'подсказка «кликните цвет»');
  const box = await page.locator('#clr-canvas').boundingBox();
  await page.locator('#clr-canvas').click({ position: { x: box.width * 0.5, y: box.height * 0.45 } }); // локатор сам прокручивает к превью
  await page.waitForTimeout(200);
  const red = await canvasPx(page, 0.5, 0.45), white = await canvasPx(page, 0.1, 0.1), dark = await canvasPx(page, 0.5, 0.68);
  ok(red[2] > red[0] + 60, `красное → синее: ${red}`);
  ok(white.every((v) => v > 245), `белый фон не тронут: ${white}`);
  ok(dark[2] > dark[0] && dark[2] < red[2], `тень сохранена (тёмная часть темнее): ${dark}`);
  const f = await download(page); const info = await fileInfo(page, f.p, 0.5, 0.45);
  ok(info.w === 1000 && info.h === 700 && info.px[2] > info.px[0] + 60, `файл ${f.name} ${info.w}×${info.h}, пиксель ${info.px}`);
  await page.check('#clr-all'); await page.waitForTimeout(200);
  ok(await page.locator('#clr-tol-wrap').isHidden(), '«Change all colors» прячет ползунок схожести');
  ok((await page.evaluate(() => window.__ev)).some(([n, d]) => n === 'clr-download' && d.kind === 'recolor' && d.picked), 'событие clr-download recolor');
  await page.screenshot({ path: `${SHOTS}/recolor-done.png` });
  await page.setInputFiles('#clr-file', { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await page.waitForSelector('#clr-error:not([hidden])');
  ok(/image files/.test(await page.textContent('#clr-error-text')), 'txt → понятная ошибка');
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
for (const p of ['/brighten-image/', '/change-image-color/']) {
  const { page, errors } = await open(p, { width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) && errors.length === 0, `${p} мобильный 390: без прокрутки и ошибок`);
}
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
