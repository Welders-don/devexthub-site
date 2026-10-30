// e2e страницы /translate-picture/ (OCR-виджет + перевод). Запуск: BASE=http://localhost:<порт>/translate-picture/ node tools/e2e_translate_tool.mjs
// Перевод на устройстве (Chrome Translator API) подменяем: в headless его нет. MyMemory в кейсе 1 настоящий (пара запросов).
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const BASE = process.env.BASE || 'http://localhost:8088/translate-picture/';
const TMP = '/home/client/workspace/tmp/trn-e2e'; const SHOTS = new URL('../releases/translate-picture/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
async function shot(html, name) {
  const p = await browser.newPage({ viewport: { width: 700, height: 220 } });
  await p.setContent(`<div style="font:28px Arial;padding:24px;line-height:1.5">${html}</div>`);
  await p.screenshot({ path: `${TMP}/${name}` }); await p.close();
}
await shot('El restaurante abre a las ocho.<br>La cuenta, por favor.', 'es.png');
await shot('The museum is closed on Monday.', 'en.png');

// mode: none (нет API) | available | downloadable; mm: real | quota | fake
async function open({ mode = 'none', mm = 'real', viewport = { width: 1280, height: 900 } } = {}) {
  const ctx = await browser.newContext({ viewport, locale: 'en-US' });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  if (mm === 'quota') await page.route(/mymemory/, (r) => r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.' }, quotaFinished: true, responseStatus: 429 }) }));
  if (mm === 'fake') await page.route(/mymemory/, (r) => r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ responseData: { translatedText: 'ONLINE it&#39;s' }, responseStatus: 200 }) }));
  await page.addInitScript((mode) => {
    window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) };
    if (mode === 'none') return;
    window.__created = 0;
    // Жест от выбора файла истёк (долгий OCR на телефоне): так страница обязана попросить клик.
    if (mode === 'downloadable') Object.defineProperty(navigator, 'userActivation', { get: () => ({ isActive: false }) });
    window.Translator = {
      availability: async () => (window.__created ? 'available' : mode),
      create: async (o) => {
        window.__created++; o.monitor?.({ addEventListener: () => {} });
        return { translate: async (t) => `[${o.sourceLanguage}>${o.targetLanguage}] ${t}`, destroy() {} }; },
    };
  }, mode);
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  return { page, errors };
}
const ev = (page, n) => page.evaluate((n) => window.__ev.filter(([x]) => x === n).map(([, d]) => d), n);
const settle = (page) => page.waitForFunction(() => { const n = document.getElementById('trn-note').textContent; return n && !/^Translating/.test(n); }, null, { timeout: 60000 });

// 1. Нет API → настоящий MyMemory, испанская картинка → английский; смена языка → перевод заново
{
  const { page, errors } = await open();
  await page.selectOption('#oxt-lang', 'spa');
  await page.setInputFiles('#oxt-file', `${TMP}/es.png`);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  await settle(page);
  const tr = await page.inputValue('#trn-text');
  ok(/restaurant/i.test(tr) && /(bill|check|account)/i.test(tr) && /MyMemory/.test(await page.textContent('#trn-note')), `ES → EN через MyMemory: «${tr.replace(/\n/g, ' / ')}»`);
  ok((await ev(page, 'trn-run')).some((d) => d.result === 'ok' && d.engine === 'mymemory' && d.src === 'es' && d.tgt === 'en'), `событие trn-run: ${JSON.stringify(await ev(page, 'trn-run'))}`);
  await page.screenshot({ path: `${SHOTS}/desktop-done.png`, fullPage: false });
  await page.selectOption('#trn-target', 'fr');
  await settle(page);
  ok(/restaurant/i.test(await page.inputValue('#trn-text')) && !/bill/i.test(await page.inputValue('#trn-text')), `смена на французский: «${(await page.inputValue('#trn-text')).replace(/\n/g, ' / ')}»`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 2. API доступен: перевод на устройстве; английская картинка → цель не английский
{
  const { page, errors } = await open({ mode: 'available' });
  await page.selectOption('#oxt-lang', 'eng');
  await page.setInputFiles('#oxt-file', `${TMP}/en.png`);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  await settle(page);
  const tr = await page.inputValue('#trn-text');
  ok(await page.locator('#trn-device').isHidden() && await page.locator('#trn-online').isHidden(), 'пакет уже есть: кнопок скачивания не видно');
  ok(tr.startsWith('[en>es] The museum is closed on Monday') && /on your device/.test(await page.textContent('#trn-note')), `на устройстве: «${tr}», цель ${await page.inputValue('#trn-target')}`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 3. Языковой пакет надо скачать: кнопки, клик = скачивание и перевод; «онлайн» = MyMemory
{
  const { page, errors } = await open({ mode: 'downloadable', mm: 'fake' });
  await page.selectOption('#oxt-lang', 'spa');
  await page.setInputFiles('#oxt-file', `${TMP}/es.png`);
  await page.waitForSelector('#trn-device:not([hidden])', { timeout: 120000 });
  ok(await page.locator('#trn-online').isVisible() && !(await page.inputValue('#trn-text')), `просим клик: «${await page.textContent('#trn-note')}»`);
  await page.click('#trn-online');
  await settle(page);
  ok(await page.inputValue('#trn-text') === "ONLINE it's\n\nONLINE it's" || /ONLINE it's/.test(await page.inputValue('#trn-text')), `«Translate online instead» → MyMemory, сущности раскрыты: «${(await page.inputValue('#trn-text')).replace(/\n/g, ' / ')}»`);
  await page.click('#trn-go'); // клик = жест: пакет качается сразу, без второй кнопки
  await settle(page);
  ok((await page.inputValue('#trn-text')).startsWith('[es>en]') && await page.locator('#trn-device').isHidden(), `Translate again (жест) → пакет и перевод на устройстве: «${(await page.inputValue('#trn-text')).slice(0, 60)}»`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 4. Лимит MyMemory кончился → понятный текст
{
  const { page } = await open({ mm: 'quota' });
  await page.selectOption('#oxt-lang', 'spa');
  await page.setInputFiles('#oxt-file', `${TMP}/es.png`);
  await page.waitForSelector('#oxt-done:not([hidden])', { timeout: 120000 });
  await settle(page);
  ok(/limit for today/.test(await page.textContent('#trn-note')) && !(await page.inputValue('#trn-text')), `лимит: «${await page.textContent('#trn-note')}»`);
  ok((await ev(page, 'trn-run')).some((d) => d.result === 'quota'), 'событие trn-run quota');
}

// 5. Мобильный
{
  const { page, errors } = await open({ viewport: { width: 390, height: 844 } });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS');
}
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
