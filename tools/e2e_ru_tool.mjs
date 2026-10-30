// e2e русских страниц /ru/tekst-iz-foto/ и /ru/perevod-s-kartinki/ (OCR + перевод, тексты по <html lang="ru">).
// Запуск: SITE=http://localhost:<порт> node tools/e2e_ru_tool.mjs. MyMemory настоящий (один короткий запрос).
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const SITE = process.env.SITE || 'http://localhost:8088';
const TMP = '/home/client/workspace/tmp/ru-e2e'; const SHOTS = new URL('../releases/ru-pages/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
async function shot(html, name) { const p = await browser.newPage({ viewport: { width: 700, height: 200 } }); await p.setContent(`<div style="font:28px Arial;padding:24px;line-height:1.5">${html}</div>`); await p.screenshot({ path: `${TMP}/${name}` }); await p.close(); }
await shot('Сегодня хорошая погода.<br>Магазин открыт до девяти.', 'ru.png');
await shot('The museum is closed on Monday.', 'en.png');
async function open(path, viewport = { width: 1280, height: 900 }) {
  // Браузер английский: язык распознавания на русских страницах всё равно должен остаться заданным страницей.
  const ctx = await browser.newContext({ viewport, locale: 'en-US' });
  const page = await ctx.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE + path); return { page, errors };
}
{
  const { page, errors } = await open('/ru/tekst-iz-foto/');
  ok(await page.inputValue('#oxt-lang') === 'rus', `текст из фото: язык по умолчанию ${await page.inputValue('#oxt-lang')} (браузер en-US)`);
  await page.setInputFiles('#oxt-file', `${TMP}/ru.png`);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  const t = await page.inputValue('#oxt-text');
  ok(/хорошая погода/.test(t) && /Магазин открыт/.test(t), `распознано: «${t.replace(/\n/g, ' / ')}»`);
  ok(/^Найдено слов: \d+/.test(await page.textContent('#oxt-summary')), `сводка по-русски: «${await page.textContent('#oxt-summary')}»`);
  await page.click('#oxt-copy'); ok(await page.textContent('#oxt-copy') === 'Скопировано', 'кнопка «Скопировано»');
  ok((await page.evaluate(() => window.__ev)).some(([n, d]) => n === 'ocr-run' && d.result === 'ok' && d.lang === 'rus'), 'событие ocr-run ok rus');
  await page.screenshot({ path: `${SHOTS}/tekst-desktop-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
{
  const { page, errors } = await open('/ru/perevod-s-kartinki/');
  ok(await page.inputValue('#oxt-lang') === 'eng' && await page.inputValue('#trn-target') === 'ru', 'перевод: по умолчанию английский → русский');
  await page.setInputFiles('#oxt-file', `${TMP}/en.png`);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  await page.waitForFunction(() => { const n = document.getElementById('trn-note').textContent; return n && !/^Перевожу/.test(n); }, null, { timeout: 60000 });
  const tr = await page.inputValue('#trn-text'); const note = await page.textContent('#trn-note');
  ok(/[а-яё]/i.test(tr) && /музей/i.test(tr), `перевод: «${tr}»`);
  ok(/^Переведено \(Русский\) бесплатным сервисом MyMemory/.test(note), `пометка по-русски: «${note}»`);
  ok((await page.evaluate(() => window.__ev)).some(([n, d]) => n === 'trn-run' && d.result === 'ok' && d.src === 'en' && d.tgt === 'ru'), 'событие trn-run en → ru');
  await page.screenshot({ path: `${SHOTS}/perevod-desktop-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
for (const path of ['/ru/tekst-iz-foto/', '/ru/perevod-s-kartinki/']) {
  const { page, errors } = await open(path, { width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) && errors.length === 0, `${path} мобильный 390: без прокрутки и ошибок`);
  ok(await page.evaluate(() => [...document.querySelectorAll('link[rel=alternate]')].map((l) => l.hreflang).join(',')) === 'ru,en,x-default', `${path}: hreflang ru,en,x-default`);
}
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
