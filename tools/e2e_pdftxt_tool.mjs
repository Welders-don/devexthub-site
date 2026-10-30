// e2e страницы /pdf-to-text/. Запуск: BASE=http://localhost:<порт>/pdf-to-text/ node tools/e2e_pdftxt_tool.mjs
// Фикстуры: синтетическая выписка из репо Pdftoexel, «скан» (PDF из картинки), битый PDF, PNG.
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const BASE = process.env.BASE || 'http://localhost:8087/pdf-to-text/';
const TMP = '/tmp/ptx-e2e';
const SHOTS = new URL('../releases/pdf-to-text/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
const SAMPLE = '/home/client/projects/Pdftoexel/tests/fixtures/bank-statement-sample.pdf';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
{ const p = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await p.setContent('<div style="font:20px sans-serif;padding:20px">Scanned text here</div>');
  const png = (await p.screenshot()).toString('base64'); fs.writeFileSync(`${TMP}/pic.png`, Buffer.from(png, 'base64'));
  await p.setContent(`<img src="data:image/png;base64,${png}" style="width:100%">`); await p.pdf({ path: `${TMP}/scan.pdf` }); await p.close(); }
fs.writeFileSync(`${TMP}/broken.pdf`, '%PDF-1.4\nnot really a pdf');
async function openPage(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE); return { page, errors };
}
const settled = (p) => p.waitForSelector('#ptx-done:not([hidden]), #ptx-scan:not([hidden]), #ptx-error:not([hidden])', { timeout: 60000 });
{ const { page, errors } = await openPage();
  await page.setInputFiles('#ptx-file', SAMPLE); await settled(page);
  const text = await page.inputValue('#ptx-text');
  const lines = text.split('\n');
  ok(await page.locator('#ptx-done').isVisible() && text.length > 200, `текст: ${text.length} симв., ${lines.length} строк; «${await page.textContent('#ptx-summary')}»`);
  console.log('     первые строки:', JSON.stringify(lines.slice(0, 6)));
  ok(lines.some((l) => /\d/.test(l) && /[A-Za-z]{3}/.test(l) && l.split(/\s+/).length >= 3), 'строки собраны (в строке и слова, и числа)');
  await page.click('#ptx-copy');
  ok((await page.evaluate(() => navigator.clipboard.readText())) === text, 'Copy all = текст');
  const [d] = await Promise.all([page.waitForEvent('download'), page.click('#ptx-txt')]);
  ok(d.suggestedFilename() === 'bank-statement-sample.txt' && fs.readFileSync(await d.path(), 'utf8') === text, `.txt: ${d.suggestedFilename()}`);
  const ev = await page.evaluate(() => window.__ev);
  ok(ev.some(([n, x]) => n === 'ptx-convert' && x.result === 'ok') && ev.some(([n]) => n === 'ptx-copy') && ev.some(([n]) => n === 'ptx-download'), 'события convert/copy/download');
  await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`); }
for (const [f, sel, re, label] of [[`${TMP}/scan.pdf`, 'ptx-scan', /scan/, 'скан'], [`${TMP}/broken.pdf`, 'ptx-error', /couldn't read/, 'битый'], [`${TMP}/pic.png`, 'ptx-error', /takes PDF/, 'png']]) {
  const { page } = await openPage(); await page.setInputFiles('#ptx-file', f); await settled(page);
  ok(await page.locator(`#${sel}`).isVisible() && re.test(await page.textContent(`#${sel}`)), `${label} → экран ${sel}`); }
{ const { page, errors } = await openPage({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS'); }
await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
