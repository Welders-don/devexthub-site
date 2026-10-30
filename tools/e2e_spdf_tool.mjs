// e2e страницы /make-pdf-searchable/ (скан-PDF → тот же PDF + невидимый текстовый слой).
// Запуск: BASE=http://localhost:<порт>/make-pdf-searchable/ node tools/e2e_spdf_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const BASE = process.env.BASE || 'http://localhost:8088/make-pdf-searchable/';
const TMP = '/home/client/workspace/tmp/spdf-e2e'; const SHOTS = new URL('../releases/make-pdf-searchable/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });

// Фикстуры: страница-картинка (скан) и страница с настоящим текстом.
const pngOf = async (html) => { const p = await browser.newPage({ viewport: { width: 1100, height: 1400 } }); await p.setContent(`<div style="font:34px Georgia;padding:70px;line-height:1.6;background:#fff">${html}</div>`); const b = (await p.screenshot()).toString('base64'); await p.close(); return b; };
const img1 = await pngOf('Invoice number 4471<br>Delivery of steel valves<br>Total amount due by Friday<br>Thank you for your business');
const img2 = await pngOf('Second page of the contract<br>Warranty period twelve months<br>Signed in Rotterdam');
async function pdfOf(pages, name) {
  const p = await browser.newPage();
  await p.setContent(pages.map((x) => `<div style="page-break-after:always;height:1040px">${x}</div>`).join(''));
  await p.pdf({ path: `${TMP}/${name}`, format: 'A4', margin: { top: 0, bottom: 0, left: 0, right: 0 } }); await p.close();
}
const scanPage = (b) => `<img src="data:image/png;base64,${b}" style="width:100%">`;
await pdfOf([scanPage(img1), scanPage(img2)], 'scan.pdf');
await pdfOf(['<div style="font:24px Arial;padding:60px">Digital page with real text: quarterly report</div>', scanPage(img2)], 'mixed.pdf');
await pdfOf(['<div style="font:24px Arial;padding:60px">Already searchable document text here</div>'], 'digital.pdf');

async function open(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE); return { page, errors };
}
// Текст готового PDF читаем тем же pdf.js, что на сайте.
// Ожидание для «Invoice»: body 8 px + отступ 70 px картинки 1100 px, вписанной в 778 css px → x ≈ 47 pt; базовая линия ≈ 68 pt сверху.
const textOf = (page, file) => page.evaluate(async (b64) => {
  const pdfjs = await import('/assets/pdfx/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdfx/pdf.worker.min.mjs';
  const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const pdf = await pdfjs.getDocument({ data }).promise; const out = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i); const vp = pg.getViewport({ scale: 1 });
    const items = (await pg.getTextContent()).items.filter((x) => x.str.trim());
    out.push({ first: items[0] && { str: items[0].str, x: items[0].transform[4], y: vp.height - items[0].transform[5] }, text: items.map((x) => x.str).join(' '), inside: items.every((x) => x.transform[4] >= -1 && x.transform[4] <= vp.width + 1 && x.transform[5] >= -1 && x.transform[5] <= vp.height + 1) });
  }
  return out;
}, fs.readFileSync(file).toString('base64'));
async function convert(page, file) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.setInputFiles('#spdf-file', file)]);
  const p = `${TMP}/out-${d.suggestedFilename()}`; await d.saveAs(p);
  await page.waitForSelector('#spdf-done:not([hidden])'); return { p, name: d.suggestedFilename() };
}

// 1. Скан 2 стр.: текст находится, координаты внутри страниц, размер почти как был
{
  const { page, errors } = await open();
  const t0 = Date.now();
  const r = await convert(page, `${TMP}/scan.pdf`);
  const pages = await textOf(page, r.p);
  const inKb = fs.statSync(`${TMP}/scan.pdf`).size / 1024, outKb = fs.statSync(r.p).size / 1024;
  ok(r.name === 'scan-searchable.pdf' && pages.length === 2, `скан → ${r.name}, ${pages.length} стр. за ${((Date.now() - t0) / 1000).toFixed(1)} с`);
  ok(/Invoice/.test(pages[0].text) && /steel valves/i.test(pages[0].text) && /Rotterdam/.test(pages[1].text), `текст найден: «${pages[0].text.slice(0, 60)}» / «${pages[1].text.slice(0, 50)}»`);
  ok(pages.every((x) => x.inside), 'все слова в пределах страницы');
  const f = pages[0].first;
  ok(f && f.str === 'Invoice' && Math.abs(f.x - 47) < 4 && Math.abs(f.y - 68) < 4, `первое слово под картинкой: ${JSON.stringify(f)} (ждали x≈47, y≈68 pt)`);
  ok(outKb < inKb * 1.3 + 60, `размер ${Math.round(inKb)} → ${Math.round(outKb)} КБ (картинки не пережаты)`);
  const run = (await page.evaluate(() => window.__ev)).find(([n]) => n === 'spdf-run');
  ok(run && run[1].result === 'ok' && run[1].ocrPages === 2 && run[1].words > 15, `событие spdf-run: ${JSON.stringify(run && run[1])}`);
  ok(/words added on 2 scanned pages/.test(await page.textContent('#spdf-summary')), `сводка: «${await page.textContent('#spdf-summary')}»`);
  await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
// 2. Смешанный: цифровая страница не трогается, скан получает текст
{
  const { page, errors } = await open();
  const r = await convert(page, `${TMP}/mixed.pdf`);
  const pages = await textOf(page, r.p);
  ok(/quarterly report/.test(pages[0].text) && !/Rotterdam/.test(pages[0].text) && /Rotterdam/.test(pages[1].text), 'смешанный: 1-я как была, 2-я с текстом');
  ok(/1 page already had text and was left as is/.test(await page.textContent('#spdf-summary')), `сводка: «${await page.textContent('#spdf-summary')}»`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
// 3. Уже текстовый, не-PDF, отмена
{
  const { page, errors } = await open();
  await page.setInputFiles('#spdf-file', `${TMP}/digital.pdf`);
  await page.waitForSelector('#spdf-done:not([hidden])', { timeout: 60000 });
  ok(/already searchable/.test(await page.textContent('#spdf-done-title')) && await page.locator('#spdf-dl').isHidden(), 'текстовый PDF → «already searchable», без скачивания');
  await page.click('.spdf-again >> nth=1').catch(() => {});
  await page.setInputFiles('#spdf-file', { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') });
  await page.waitForSelector('#spdf-error:not([hidden])');
  ok(/takes PDF files/.test(await page.textContent('#spdf-error-text')), 'png → понятная ошибка');
  await page.setInputFiles('#spdf-file', `${TMP}/scan.pdf`);
  await page.waitForFunction(() => /reading text/.test(document.getElementById('spdf-status').textContent), null, { timeout: 60000 });
  await page.click('#spdf-cancel');
  await page.waitForSelector('#spdf-idle:not([hidden])', { timeout: 15000 });
  ok(true, 'отмена посреди распознавания → к выбору файла');
  ok((await page.evaluate(() => window.__ev)).some(([n, d]) => n === 'spdf-run' && d.result === 'cancel'), 'событие cancel');
  await page.setInputFiles('#spdf-file', `${TMP}/scan.pdf`);
  await page.waitForSelector('#spdf-done:not([hidden])', { timeout: 180000 });
  ok(/words added/.test(await page.textContent('#spdf-summary')), 'после отмены следующий файл проходит');
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
// 4. Мобильный
{
  const { page, errors } = await open({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) && errors.length === 0, 'мобильный 390: без прокрутки и ошибок');
  await page.locator('#try').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
}
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
