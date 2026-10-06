// Скрины кабинета для статьи can-chatgpt-transcribe-a-video: настоящий транскрипт речи JFK (Deepgram nova-3),
// настоящее саммари и причёска (llm.js), на тестовой БД. Запуск:
// DATABASE_URL="postgresql://client@localhost/capitan_test?host=/tmp&port=5499" node shot.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/client/projects/JobAgent/node_modules/playwright');
const SRV = '/home/client/projects/Capitan/server/src';
const SITE = '/home/client/projects/Devexthub-site';
const HERE = __dirname;
if (!/5499|capitan_test/.test(process.env.DATABASE_URL || '')) throw new Error('только тестовая БД');
const db = require(path.join(SRV, 'services/db'));

(async () => {
  const uuid = crypto.randomUUID();
  const sid = 'sid-' + uuid;
  await db.query(`INSERT INTO users (uuid, fingerprint) VALUES ($1, $2)`, [uuid, 'fp-' + uuid]);
  await db.query(`INSERT INTO site_sessions (sid, user_uuid) VALUES ($1, $2)`, [sid, uuid]);
  const text = fs.readFileSync(path.join(HERE, 'transcript.txt'), 'utf8');
  const segs = fs.readFileSync(path.join(HERE, 'segments.json'), 'utf8');
  const { rows } = await db.query(
    `INSERT INTO transcriptions (user_uuid, transcript_text, segments, title, platform, duration_sec, language, expires_at)
     VALUES ($1, $2, $3, 'JFK at Rice University, 1962', 'archive.org', 1428, 'en', now() + interval '30 days') RETURNING id`,
    [uuid, text, segs]);
  const tid = rows[0].id;
  await db.query(`INSERT INTO summaries (transcription_id, user_uuid, summary_text, model) VALUES ($1, $2, $3, 'openai/gpt-5-nano')`,
    [tid, uuid, fs.readFileSync(path.join(HERE, 'summary.txt'), 'utf8')]);
  await db.query(`INSERT INTO polishes (transcription_id, user_uuid, polished_text, model) VALUES ($1, $2, $3, 'openai/gpt-5-nano')`,
    [tid, uuid, fs.readFileSync(path.join(HERE, 'polished.txt'), 'utf8')]);

  const app = require(path.join(SRV, '../node_modules/fastify'))();
  await app.register(require(path.join(SRV, 'routes/site')), { prefix: '/api' });
  const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
  const page = await (await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 800 } })).newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.route('https://transcribe.devexthub.com:8443/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const res = await app.inject({ method: req.method(), url: url.pathname + url.search,
      headers: { cookie: 'dvx_sid=' + sid, 'content-type': 'application/json' }, payload: req.postData() || undefined });
    await route.fulfill({ status: res.statusCode, body: res.body, headers: { 'content-type': 'application/json', 'access-control-allow-origin': 'https://www.devexthub.com', 'access-control-allow-credentials': 'true' } });
  });
  await page.route('https://www.devexthub.com/**', async (route) => {
    const p = new URL(route.request().url()).pathname;
    const file = path.join(SITE, p.endsWith('/') ? p + 'index.html' : p);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
    await route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { 'content-type': type } });
  });
  await page.route(/accounts\.google\.com|umami|googletagmanager/, (r) => r.fulfill({ status: 200, body: '' }));
  await page.goto('https://www.devexthub.com/app/?t=' + tid);
  await page.waitForSelector('.summary');
  await page.waitForTimeout(500);
  const col = async () => { const b = await page.locator('.app-main').boundingBox(); return { x: b.x, y: 72, width: b.width, height: 728 }; };
  await page.evaluate(() => { const h = document.querySelector('.detail-head'); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 150); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(HERE, 'cab-summary.png'), clip: await col() });
  await page.locator('.tab', { hasText: 'Transcript' }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const b = document.querySelector('.js-body');
    window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 100);
    const p = [...b.querySelectorAll('*')].find((e) => e.children.length === 0 && /^President Pitzer/.test(e.textContent.trim()));
    let box = p.parentElement; while (box && box.scrollHeight <= box.clientHeight + 2) box = box.parentElement;
    box.scrollTop += p.getBoundingClientRect().top - box.getBoundingClientRect().top - 250;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(HERE, 'cab-transcript.png'), clip: await col() });
  await page.locator('.tab', { hasText: 'Readable' }).first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => { const b = document.querySelector('.js-body'); window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 100); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(HERE, 'cab-readable.png'), clip: await col() });
  console.log('tabs:', await page.locator('.tab').allTextContents());
  await page.locator('.tab', { hasText: 'Transcript' }).first().click();
  console.log('labels visible/total:', await page.$$eval('.seg-speaker', (a) => [a.filter((e) => getComputedStyle(e).visibility !== 'hidden').length, a.length]), 'rows:', await page.locator('.seg').count());

  await browser.close();
  await db.query(`DELETE FROM polishes WHERE transcription_id=$1`, [tid]);
  await db.query(`DELETE FROM summaries WHERE transcription_id=$1`, [tid]);
  await db.query(`DELETE FROM transcriptions WHERE id=$1`, [tid]);
  await db.query(`DELETE FROM site_sessions WHERE sid=$1`, [sid]);
  await db.query(`DELETE FROM users WHERE uuid=$1`, [uuid]);
  process.exit(0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
