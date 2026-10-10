// e2e страницы-инструмента /pdf-to-excel/bank-statement/ в headless Chromium.
// Запуск: node tools/e2e_bank_tool.mjs  (сайт должен отдаваться по http://localhost:8099)
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = pw;
const require = createRequire(import.meta.url);
const JSZip = require('../assets/pdfx/jszip.min.js');

const BASE = 'http://localhost:8099/pdf-to-excel/bank-statement/';
const TMP = '/tmp/bst-e2e';
const SHOTS = new URL('../releases/bank-statement-tool/', import.meta.url).pathname;
const FIXTURES = {
  synthetic: '/home/client/projects/Pdftoexel/tests/fixtures/bank-statement-sample.pdf',
  mac: new URL('../releases/blog-mac-shots/statement.pdf', import.meta.url).pathname,
};
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++; };

const browser = await chromium.launch({
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
});

// Скан = PDF из одной картинки, текстового слоя нет.
async function makeScanPdf() {
  const p = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await p.setContent('<div style="font:20px sans-serif;padding:20px">Date Description Amount<br>01/09 Coffee 4.50<br>02/09 Rent 1,200.00</div>');
  const png = (await p.screenshot()).toString('base64');
  await p.setContent(`<img src="data:image/png;base64,${png}" style="width:100%">`);
  await p.pdf({ path: `${TMP}/scan.pdf` });
  await p.close();
}
await makeScanPdf();
fs.writeFileSync(`${TMP}/broken.pdf`, '%PDF-1.4\nnot really a pdf at all');
fs.writeFileSync(`${TMP}/photo.png`, Buffer.from('89504e470d0a1a0a', 'hex'));

async function openPage(viewport = { width: 1280, height: 900 }) {
  const page = await browser.newPage({ viewport, acceptDownloads: true });
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  return { page, errors };
}

const visible = (page, id) => page.locator(`#${id}`).isVisible();

async function sheetXml(path) {
  const zip = await JSZip.loadAsync(fs.readFileSync(path));
  const name = Object.keys(zip.files).find((f) => /xl\/worksheets\/sheet1\.xml$/.test(f));
  return zip.file(name).async('string');
}

// 1-2. Текстовые выписки → лист с числами
for (const [label, file] of Object.entries(FIXTURES)) {
  const { page, errors } = await openPage();
  await page.setInputFiles('#bst-file', file);
  await page.waitForSelector('#bst-done:not([hidden]), #bst-error:not([hidden]), #bst-scan:not([hidden]), #bst-empty:not([hidden])', { timeout: 20000 });
  ok(await visible(page, 'bst-done'), `${label}: экран готового результата`);
  const rows = await page.locator('#bst-preview tr').count();
  ok(rows > 3, `${label}: превью ${rows} строк`);
  console.log('     ', (await page.locator('#bst-summary').textContent()).trim());
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#bst-xlsx')]);
  ok(/\.xlsx$/.test(dl.suggestedFilename()), `${label}: имя файла ${dl.suggestedFilename()}`);
  const xlsxPath = `${TMP}/${label}.xlsx`;
  await dl.saveAs(xlsxPath);
  const xml = await sheetXml(xlsxPath);
  const numeric = (xml.match(/<c [^>]*>(?:<f>[^<]*<\/f>)?<v>-?[\d.]+<\/v><\/c>/g) || []).filter((c) => !/t="(s|inlineStr|str)"/.test(c)).length;
  ok(numeric >= 4, `${label}: в xlsx ${numeric} числовых ячеек`);
  const [dlCsv] = await Promise.all([page.waitForEvent('download'), page.click('#bst-csv')]);
  const csv = fs.readFileSync(await dlCsv.path(), 'utf8');
  ok(csv.split('\n').length > 3, `${label}: csv ${csv.split('\n').length} строк`);
  const ev = await page.evaluate(() => window.__ev);
  ok(ev.some(([n, d]) => n === 'bst-convert' && d.result === 'ok'), `${label}: событие bst-convert ok`);
  ok(ev.filter(([n]) => n === 'bst-download').length === 2, `${label}: 2 события bst-download`);
  ok(errors.length === 0, `${label}: без ошибок JS ${errors.join('; ')}`);
  if (label === 'mac') await page.screenshot({ path: `${SHOTS}/desktop-done.png`, fullPage: false });
  await page.close();
}

// 3. Скан → предложение расширения, а не пустой Excel (негатив: результата быть не должно)
{
  const { page } = await openPage();
  await page.setInputFiles('#bst-file', `${TMP}/scan.pdf`);
  await page.waitForSelector('#bst-scan:not([hidden]), #bst-done:not([hidden])', { timeout: 20000 });
  ok(await visible(page, 'bst-scan'), 'скан: экран «это скан»');
  ok(!(await visible(page, 'bst-done')), 'скан: результата нет');
  const href = await page.locator('#bst-scan a.store-link').getAttribute('href');
  ok(href.includes('utm_source=devexthub_tool'), 'скан: ссылка в стор с UTM');
  await page.screenshot({ path: `${SHOTS}/desktop-scan.png` });
  await page.close();
}

// 4. Битый PDF → понятная ошибка
{
  const { page } = await openPage();
  await page.setInputFiles('#bst-file', `${TMP}/broken.pdf`);
  await page.waitForSelector('#bst-error:not([hidden]), #bst-done:not([hidden])', { timeout: 20000 });
  ok(await visible(page, 'bst-error'), 'битый: экран ошибки');
  ok(/couldn't read/.test(await page.locator('#bst-error-text').textContent()), 'битый: текст причины');
  await page.close();
}

// 5. Не PDF → ошибка без попытки конвертации
{
  const { page } = await openPage();
  await page.setInputFiles('#bst-file', `${TMP}/photo.png`);
  ok(await visible(page, 'bst-error'), 'png: экран ошибки');
  ok(/takes PDF/.test(await page.locator('#bst-error-text').textContent()), 'png: текст «нужен PDF»');
  // «Convert another» снова открывает выбор файла
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#bst-error .bst-again')]);
  ok(!!chooser, 'png: кнопка повтора открывает выбор файла');
  await page.close();
}

// 6. Телефон: результат помещается, таблица скроллится внутри блока
{
  const { page } = await openPage({ width: 390, height: 844 });
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  await page.setInputFiles('#bst-file', FIXTURES.mac);
  await page.waitForSelector('#bst-done:not([hidden])', { timeout: 20000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  ok(!overflow, 'телефон: нет горизонтального скролла страницы');
  await page.locator('#bst-done').screenshot({ path: `${SHOTS}/mobile-done.png` });
  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсе проверки зелёные');
process.exit(fails ? 1 : 0);
