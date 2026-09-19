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
let meOverride = null;
let summaryDelay = 0;

async function makePage(browser, { authed = true, locale } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale });
  await page.route(API, async (route) => {
    const url = route.request().url();
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (url.includes('/session')) return json(200, { ok: true, transcription_id: 41 });
    if (url.includes('/me')) {
      if (!authed) return json(401, { error: 'No session' });
      return json(200, Object.assign({ transcriptions: TRANSCRIPTS, summaries_used: 2, gate_after: 3, signed_in: false, retention_days: 30, retention_signed_in: 90, signed_quota: 6, window_days: 14, window_used: 0, next_reset: null }, meOverride || {}));
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
      if (summaryDelay) await new Promise((r) => setTimeout(r, summaryDelay));
      if (summaryMode === 'gate') return json(402, { error: 'GATE', summaries_used: 3 });
      if (summaryMode === 'quota') return json(402, { error: 'QUOTA', quota: 6, window_days: 14, next_reset: '2026-10-02T00:00:00Z' });
      if (summaryMode === 'fail') return json(502, { error: 'SUMMARY_FAILED' });
      return json(200, { summary: 'Fresh summary: watering kills most plants.', cached: false });
    }
    return json(404, {});
  });
  return page;
}

const results = [];
const googleCalls = [];
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
  check('гейт обещает 90 дней вместо 30', gate.includes('90 days') && gate.includes('30'));
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

// 6b. summary=1 из панели — саммари считается само, без нажатия
{
  summaryMode = 'ok';
  const page = await makePage(browser);
  await page.goto(BASE + '?state=tick&summary=1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.summary', { timeout: 5000 });
  check('summary=1 запускает саммари сам', (await page.textContent('.summary')).includes('Fresh summary'));
  check('адрес очищен и от summary', !page.url().includes('summary='));
  await page.close();
}

// 6c. Кнопка саммари помечена beta
{
  summaryMode = 'ok';
  meOverride = null;
  const page = await makePage(browser);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  check('на кнопке саммари стоит пометка beta', (await page.textContent('button:has-text("Summarize") .beta')).trim().toLowerCase() === 'beta');
  await page.close();
}

// 6d. Вошедший видит остаток квоты, при исчерпании — экран с датой сброса
{
  summaryMode = 'quota';
  meOverride = { signed_in: true, retention_days: 90, window_used: 6, next_reset: '2026-10-02T00:00:00Z' };
  const page = await makePage(browser);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  const head = await page.textContent('#retention');
  check('в шапке НЕТ счётчика остатка (обжигались на счётчике транскрипций)', !/\d+\s*(of|из)\s*\d+/.test(head), head.trim());
  await page.click('button:has-text("Summarize")');
  await page.waitForSelector('.gate');
  const box = await page.textContent('.gate');
  check('экран квоты вместо саммари', box.includes('Summaries for this period are used up'));
  check('в экране квоты нет числа использованных', !/\b\d+\s+summaries\b/.test(box));
  check('в экране квоты есть дата разблокировки', /Oct\s*2/.test(box), box.slice(0, 120));
  check('в экране квоты сказано про beta', box.toLowerCase().includes('beta'));
  await page.close();
  meOverride = null;
  summaryMode = 'ok';
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

// 9. Google-вход. Сам GIS в тест не пускаем — подменяем заглушкой и смотрим, что наш код
//    зовёт renderButton, шлёт credential на /google и переживает отказ.
for (const mode of ['ok', 'fail']) {
  const page = await makePage(browser);
  const CLIENT_ID = '322544381088-test.apps.googleusercontent.com';
  meOverride = { client_id: CLIENT_ID };

  await page.route(/accounts\.google\.com\/gsi\/client/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `window.__gsi = {};
             window.google = { accounts: { id: {
               initialize: function (o) { window.__gsi.cb = o.callback; window.__gsi.clientId = o.client_id; },
               renderButton: function (box) { window.__gsi.rendered = (window.__gsi.rendered || 0) + 1; box.dataset.gsi = '1'; },
             } } };`,
    })
  );
  await page.route(/\/api\/site\/google/, (route) => {
    googleCalls.push(JSON.parse(route.request().postData() || '{}'));
    return route.fulfill({
      status: mode === 'ok' ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(mode === 'ok' ? { ok: true, email: 'denis@example.com' } : { error: 'invalid_token' }),
    });
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.waitForFunction(() => window.__gsi && window.__gsi.rendered > 0, null, { timeout: 4000 }).catch(() => {});

  if (mode === 'ok') {
    check('кнопка Google отрисована в шапке', (await page.getAttribute('#signin', 'data-gsi')) === '1');
    check('в GIS ушёл client_id с бэкенда', (await page.evaluate(() => window.__gsi.clientId)) === CLIENT_ID);

    summaryMode = 'gate';
    await page.click('.item');
    await page.waitForSelector('.actions button');
    await page.click('.actions button');
    await page.waitForSelector('.gate');
    check('в экране гейта тоже есть кнопка входа', (await page.getAttribute('.gate-signin', 'data-gsi')) === '1');
    check('гейт больше не обещает вход «в следующем обновлении»',
      !/next update/i.test(await page.textContent('.gate')));
    summaryMode = 'ok';

    meOverride = { client_id: CLIENT_ID, signed_in: true, email: 'denis@example.com', retention_days: 90 };
    await page.evaluate(() => window.__gsi.cb({ credential: 'fake.jwt.token' }));
    await page.waitForFunction(() => /denis@example\.com/.test(document.getElementById('signin').textContent), null, { timeout: 4000 }).catch(() => {});
    check('credential ушёл на бэкенд', googleCalls.some((c) => c.credential === 'fake.jwt.token'));
    check('после входа в шапке почта, а не кнопка', /denis@example\.com/.test(await page.textContent('#signin')));
    check('после входа срок стал 90 дней', /90/.test(await page.textContent('#retention')));
  } else {
    await page.evaluate(() => window.__gsi.cb({ credential: 'bad.token' }));
    await page.waitForSelector('#signin .err', { timeout: 4000 }).catch(() => {});
    check('отказ входа показан человеку, а не молча', await page.isVisible('#signin .err'));
  }

  await page.close();
  meOverride = null;
}

// 10. Вошедшему кнопку не показываем вовсе
{
  const page = await makePage(browser);
  meOverride = { signed_in: true, email: 'a@b.co', retention_days: 90, client_id: 'x.apps.googleusercontent.com' };
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  check('вошедшему показана почта', (await page.textContent('#signin')).includes('a@b.co'));
  check('вошедшему кнопка Google не рисуется', (await page.getAttribute('#signin', 'data-gsi')) === null);
  await page.close();
  meOverride = null;
}

// 11. Пока саммари считается: кнопка гаснет, полоска едет, срок назван (жалоба 19.09)
{
  const page = await makePage(browser);
  summaryDelay = 1500;
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('.item');
  await page.waitForSelector('.js-sum');
  await page.click('.js-sum');

  await page.waitForSelector('.summary.working');
  check('пока считается — кнопка неактивна', await page.isDisabled('.js-sum'));
  check('на кнопке написано, что идёт работа', /Preparing/i.test(await page.textContent('.js-sum')));
  check('видна движущаяся полоска', await page.isVisible('.summary.working .progress span'));
  check('сказано, сколько ждать', /minute/i.test(await page.textContent('.summary.working .hint')));

  await page.waitForSelector('.summary:not(.working)', { timeout: 6000 });
  check('после готового саммари кнопка убрана', (await page.$('.js-sum')) === null);
  await page.close();
  summaryDelay = 0;
}

// 12. Сбой саммари: кнопку возвращаем — повтор имеет смысл
{
  const page = await makePage(browser);
  summaryMode = 'fail';
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('.item');
  await page.waitForSelector('.js-sum');
  await page.click('.js-sum');
  await page.waitForSelector('.summary.err');
  check('после сбоя кнопка снова активна', (await page.$('.js-sum')) !== null && !(await page.isDisabled('.js-sum')));
  check('после сбоя на кнопке снова обычный текст', /Summarize/i.test(await page.textContent('.js-sum')));
  await page.close();
  summaryMode = 'ok';
}

// 13. Гейт по лимиту: кнопку убираем — повтор не поможет
{
  const page = await makePage(browser);
  summaryMode = 'gate';
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  await page.click('.item');
  await page.waitForSelector('.js-sum');
  await page.click('.js-sum');
  await page.waitForSelector('.gate');
  check('после гейта кнопка саммари убрана', (await page.$('.js-sum')) === null);
  await page.close();
  summaryMode = 'ok';
}

// 14. Читаемость транскрипта: сегменты с таймкодами, а без них — абзацы (жалоба 19.09)
{
  const page = await makePage(browser);
  const WALL = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} about plants and watering routines.`).join(' ');
  await page.route(/\/transcriptions\/41/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      id: 41, platform: 'youtube', created_at: '2026-09-18T09:00:00Z', duration_sec: 480,
      transcript_text: WALL, summary_text: null }) })
  );
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript');
  const paras = await page.$$eval('.transcript .para', (n) => n.length);
  check('сплошной текст разложен на абзацы', paras > 1, `абзацев: ${paras}`);
  check('абзац не склеен в одну строку', (await page.$$eval('.transcript .para', (n) => n[0].textContent.length)) < WALL.length);
  await page.close();
}

{
  const page = await makePage(browser);
  await page.route(/\/transcriptions\/41/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      id: 41, platform: 'youtube', created_at: '2026-09-18T09:00:00Z', duration_sec: 480,
      transcript_text: 'a b c',
      segments: [{ t: 0, text: 'Первая реплика' }, { t: 75.5, text: 'Вторая реплика' }],
      summary_text: null }) })
  );
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.transcript .seg');
  const times = await page.$$eval('.seg-time', (n) => n.map((e) => e.textContent));
  check('сегменты показаны с таймкодами', times.length === 2, times.join(', '));
  check('таймкод в минутах и секундах', times[1] === '1:15', times[1]);
  await page.close();
}

await browser.close();
console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('❌')).length;
console.log(failed ? `\n${failed} проверок упало` : '\nвсе проверки прошли');
process.exit(failed ? 1 : 0);
