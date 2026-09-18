// e2e кабинета /app: гоняем страницу в headless Chromium с подменёнными ответами API.
// Запуск: node tools/e2e_app.mjs  (страница должна отдаваться по http://localhost:8099)
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
const { chromium } = pw;

const BASE = 'http://localhost:8099/app/';
const API = /transcribe\.devexthub\.com:8443\/api\/site/;

const TRANSCRIPTS = [
  { id: 41, platform: 'youtube', duration_sec: 480, created_at: '2026-09-18T09:00:00Z', preview: 'Today we talk about indoor plants and watering', has_summary: false },
  { id: 40, platform: 'vimeo', duration_sec: 1200, created_at: '2026-09-16T12:00:00Z', preview: 'Course module three, deployment basics', has_summary: true },
];

let summaryMode = 'ok';

async function makePage(browser, { authed = true, locale } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale });
  await page.route(API, async (route) => {
    const url = route.request().url();
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (url.includes('/session')) return json(200, { ok: true, transcription_id: 41 });
    if (url.includes('/me')) {
      if (!authed) return json(401, { error: 'No session' });
      return json(200, { transcriptions: TRANSCRIPTS, summaries_used: 2, gate_after: 3, signed_in: false, retention_days: 90 });
    }
    if (url.includes('/transcriptions/')) {
      const id = Number(url.split('/').pop());
      const t = TRANSCRIPTS.find((x) => x.id === id);
      return json(200, {
        id, platform: t.platform, duration_sec: t.duration_sec, created_at: t.created_at,
        transcript_text: 'Full transcript text for ' + id + '. <script>alert(1)</script> line two.',
        summary_text: t.has_summary ? 'Existing summary for ' + id : null,
      });
    }
    if (url.includes('/summary')) {
      if (summaryMode === 'gate') return json(402, { error: 'GATE', summaries_used: 3 });
      if (summaryMode === 'fail') return json(502, { error: 'SUMMARY_FAILED' });
      return json(200, { summary: 'Fresh summary: watering kills most plants.', cached: false });
    }
    return json(404, {});
  });
  return page;
}

const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`); };

const browser = await chromium.launch({
  headless: true,
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-crashpad'],
});

// 1. Нет сессии → пустое состояние, а не редирект на логин
{
  const page = await makePage(browser, { authed: false });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const emptyVisible = await page.isVisible('#empty');
  const appHidden = !(await page.isVisible('#app'));
  const hasCta = await page.isVisible('text=Get the extension');
  check('без сессии показывается пустое состояние', emptyVisible && appHidden && hasCta);
  await page.close();
}

// 2. Вход по билету: ?state=... → сессия → открывается нужный транскрипт, билет исчезает из адреса
{
  const page = await makePage(browser);
  await page.goto(BASE + '?state=abc123&t=41', { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  const url = page.url();
  const openItem = await page.textContent('.item.on .meta');
  check('билет в адресе не остаётся', !url.includes('state=') && !url.includes('t='), url.replace('http://localhost:8099', ''));
  check('открылся транскрипт из билета', (openItem || '').includes('youtube'));
  const shown = await page.textContent('.transcript');
  check('текст транскрипта на странице', shown.includes('Full transcript text for 41'));
  check('скрипт из текста не выполнился как HTML', !(await page.$('.transcript script')));
  await page.close();
}

// 3. Саммари по кнопке
{
  summaryMode = 'ok';
  const page = await makePage(browser);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('button:has-text("Summarize")');
  await page.waitForSelector('.summary');
  const sum = await page.textContent('.summary');
  check('саммари появляется в блоке', sum.includes('Fresh summary'));
  const marked = await page.textContent('.item.on .dot-sum');
  check('в списке появилась отметка о саммари', (marked || '').includes('summary'));
  await page.close();
}

// 4. Гейт на исчерпании лимита
{
  summaryMode = 'gate';
  const page = await makePage(browser);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('button:has-text("Summarize")');
  await page.waitForSelector('.gate');
  const gate = await page.textContent('.gate');
  check('гейт показывается вместо саммари', gate.includes('free summaries'));
  check('гейт говорит про 90 дней', gate.includes('90 days'));
  await page.close();
}

// 5. Ошибка модели не роняет страницу
{
  summaryMode = 'fail';
  const page = await makePage(browser);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('button:has-text("Summarize")');
  await page.waitForSelector('.err');
  check('ошибка саммари показывается человеку', (await page.textContent('.err')).includes('Summary failed'));
  await page.close();
}

// 6. Уже посчитанное саммари показывается сразу, без кнопки
{
  summaryMode = 'ok';
  const page = await makePage(browser);
  await page.goto(BASE + '?t=40', { waitUntil: 'networkidle' });
  await page.waitForSelector('.summary');
  const hasBtn = await page.$('button:has-text("Summarize")');
  check('готовое саммари показано сразу', (await page.textContent('.summary')).includes('Existing summary'));
  check('кнопки Summarize у него нет', !hasBtn);
  await page.close();
}

// 7. Язык интерфейса берётся из браузера
for (const [locale, marker, key] of [['ru-RU', 'Ваши транскрипты', 'ru'], ['pt-BR', 'Suas transcrições', 'pt'], ['zh-CN', '你的转录', 'zh'], ['ar-EG', 'تفريغاتك النصية', 'ar']]) {
  const page = await makePage(browser, { locale });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  const h1 = await page.textContent('#app h1');
  const lang = await page.getAttribute('html', 'lang');
  check(`интерфейс на ${key}`, h1.trim() === marker, h1.trim());
  check(`html lang=${key}`, lang === key, String(lang));
  if (key === 'ar') check('арабский разворачивается справа налево', (await page.getAttribute('html', 'dir')) === 'rtl');
  await page.close();
}

// 8. Неизвестный язык падает на английский
{
  const page = await makePage(browser, { locale: 'sv-SE' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  check('незнакомый язык → английский', (await page.textContent('#app h1')).trim() === 'Your transcripts');
  await page.close();
}

await browser.close();
console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('❌')).length;
console.log(failed ? `\n${failed} проверок упало` : '\nвсе проверки прошли');
process.exit(failed ? 1 : 0);
