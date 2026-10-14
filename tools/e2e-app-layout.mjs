// Раскладка кабинета 14.10: в шапке нет меню сайта, срок хранения под списком, а не у заголовка.
// Запуск: node tools/e2e-app-layout.mjs <корень сайта> [скрин.png]
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import { spawn } from 'node:child_process';
const [root, shot] = process.argv.slice(2);
const srv = spawn('python3', ['-m', 'http.server', '8096', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
process.on('exit', () => srv.kill());
await new Promise((r) => setTimeout(r, 800));
const b = await pw.chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 }, locale: 'ru-RU' });
await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
  const url = route.request().url();
  const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  if (!/transcribe\.devexthub\.com:8443\/api\/site/.test(url)) return route.abort();
  if (url.includes('/session')) return json({ ok: true, transcription_id: 41 });
  if (url.includes('/me')) return json({ transcriptions: [
    { id: 41, platform: 'youtube', duration_sec: 480, created_at: '2026-10-14T03:36:00Z', preview: 'Всем привет, ребят. Сегодня нам предстоит навести порядок в музее', has_summary: true },
    { id: 40, platform: 'youtube', duration_sec: 8700, created_at: '2026-10-14T03:32:00Z', preview: 'Hello everyone, guys. Today the museum needs to be tidied up', has_summary: false }],
    summaries_used: 1, gate_after: 3, signed_in: false, retention_days: 30, retention_signed_in: 90, signed_quota: 6, window_days: 14, window_used: 0, next_reset: null });
  if (url.includes('/transcriptions/')) return json({ id: 41, platform: 'youtube', duration_sec: 480, created_at: '2026-10-14T03:36:00Z', transcript_text: 'Текст транскрипта.', summary_text: 'Обзор: автор готовит музей к открытию.' });
  return json({});
});
await p.goto('http://127.0.0.1:8096/app/?t=x', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#app:not(.hidden)', { timeout: 10000 });
await p.waitForTimeout(800);
let fail = 0;
const check = (n, ok, got) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${n}${ok ? '' : ' → ' + JSON.stringify(got)}`); if (!ok) fail++; };
const headLinks = await p.locator('header a').count();
check('в шапке только логотип', headLinks === 1, headLinks);
const r = await p.evaluate(() => {
  const el = document.getElementById('retention');
  const list = document.getElementById('list');
  return { text: el.textContent, inHead: !!el.closest('.app-head'), inSide: !!el.closest('.app-side'),
    below: el.getBoundingClientRect().top >= list.getBoundingClientRect().bottom, title: el.title };
});
check('срок хранения не у заголовка', !r.inHead, r);
check('срок хранения под списком', r.inSide && r.below, r);
check('текст и подсказка на месте', /30/.test(r.text) && /90/.test(r.title), r);
check('блок инструментов слева на месте', await p.isVisible('.side-tools'));
if (shot) await p.screenshot({ path: shot, fullPage: true });
await b.close();
console.log(fail ? `${fail} FAIL` : 'ALL OK');
process.exit(fail ? 1 : 0);
