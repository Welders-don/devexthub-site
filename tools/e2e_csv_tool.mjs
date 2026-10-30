// e2e страницы /pdf-to-csv/ (движок PDF → таблицы, data-kind="csv", выбор разделителя).
// Запуск: BASE=http://localhost:<порт>/pdf-to-csv/ node tools/e2e_csv_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const BASE = process.env.BASE || 'http://localhost:8088/pdf-to-csv/';
const PDF = '/home/client/projects/Pdftoexel/tests/fixtures/bank-statement-sample.pdf';
const TMP = '/home/client/workspace/tmp/csv-e2e'; const SHOTS = new URL('../releases/pdf-to-csv/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE);
await page.setInputFiles('#bst-file', PDF);
await page.waitForSelector('#bst-done:not([hidden]), #bst-error:not([hidden]), #bst-empty:not([hidden])', { timeout: 60000 });
ok(await page.locator('#bst-done').isVisible(), `готово: ${await page.textContent('#bst-summary')}`);
async function dl(id) { const [d] = await Promise.all([page.waitForEvent('download'), page.click(id)]); const p = `${TMP}/${Date.now()}-${d.suggestedFilename()}`; await d.saveAs(p); return { p, name: d.suggestedFilename() }; }
const c1 = await dl('#bst-csv'); const t1 = fs.readFileSync(c1.p, 'utf8').replace(/^﻿/, '');
const rows1 = t1.split('\r\n');
ok(c1.name === 'bank-statement-sample.csv' && rows1.length > 5 && rows1.some((r) => r.split(',').length >= 3), `CSV запятая: ${rows1.length} строк, пример «${rows1.find((r) => /\d/.test(r))?.slice(0, 70)}»`);
await page.selectOption('#bst-sep', ';');
const c2 = await dl('#bst-csv'); const t2 = fs.readFileSync(c2.p, 'utf8').replace(/^﻿/, '');
const rows2 = t2.split('\r\n');
ok(rows2.length === rows1.length && rows2.some((r) => r.split(';').length >= 3) && t2.includes('July 1 - July 31, 2026;'), `CSV точка с запятой: «${rows2.find((r) => /\d/.test(r))?.slice(0, 70)}»`);
ok(rows2.every((r, i) => r.split(';').length >= rows1[i].split(',').length - 0 || /"/.test(rows1[i])), 'колонок с ; не меньше, чем с ,');
await page.selectOption('#bst-sep', '\t');
const c3 = await dl('#bst-csv'); const t3 = fs.readFileSync(c3.p, 'utf8');
ok(t3.includes('\t') && !t3.split('\r\n')[2]?.includes('","'), 'CSV таб: разделитель \\t');
const x = await dl('#bst-xlsx');
ok(x.name.endsWith('.xlsx') && fs.readFileSync(x.p).subarray(0, 2).toString() === 'PK', `Excel: ${x.name}`);
const ev = await page.evaluate(() => window.__ev);
ok(ev.some(([n, d]) => n === 'pcsv-convert' && d.result === 'ok'), 'событие pcsv-convert ok');
ok(['comma', 'semicolon', 'tab'].every((s) => ev.some(([n, d]) => n === 'pcsv-download' && d.fmt === 'csv' && d.sep === s)) && ev.some(([n, d]) => n === 'pcsv-download' && d.fmt === 'xlsx'), `события pcsv-download: ${ev.filter(([n]) => n === 'pcsv-download').map(([, d]) => d.sep || d.fmt).join(',')}`);
ok(/utm_campaign=pdf-to-csv/.test(await page.getAttribute('a.store-link[data-umami-event-place="csv-widget"]', 'href')), 'UTM pdf-to-csv на ссылке в стор');
await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
// не-PDF
await page.setInputFiles('#bst-file', { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') });
await page.waitForSelector('#bst-error:not([hidden])');
ok(/takes PDF files/.test(await page.textContent('#bst-error-text')), 'png → понятная ошибка');
const m = await browser.newPage({ viewport: { width: 390, height: 844 } }); await m.route(/api\.devexthub\.com/, (r) => r.abort());
await m.goto(BASE); ok(!(await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
await m.locator('#try').scrollIntoViewIfNeeded(); await m.screenshot({ path: `${SHOTS}/mobile-idle.png` });
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
