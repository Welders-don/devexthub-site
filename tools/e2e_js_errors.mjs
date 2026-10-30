// e2e перехватчика ошибок assets/track-errors.js + дымовой прогон всех страниц-инструментов (ни одной js-error при загрузке).
// Запуск: SITE=http://localhost:<порт> node tools/e2e_js_errors.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
const { chromium } = pw;
const SITE = process.env.SITE || 'http://localhost:8088';
const PAGES = ['convert-mov-to-mp4', 'mkv-to-mp4', 'video-to-gif', 'mov-to-mp3', 'pdf-to-excel', 'pdf-to-excel/bank-statement', 'pdf-to-csv', 'pdf-to-text', 'make-pdf-searchable', 'extract-text-from-image', 'image-to-word', 'translate-picture', 'scan-qr-code-from-image', 'image-enhancer', 'ai-image-upscaler', 'unblur-image', 'resize-image', 'brighten-image', 'change-image-color'];
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
async function open(path, stubNow = true) {
  const page = await browser.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript((stubNow) => {
    window.__ev = [];
    const stub = { track: (n, d) => window.__ev.push([n, d]) };
    if (stubNow) window.umami = stub; else setTimeout(() => { window.umami = stub; }, 2500); // как defer-загрузка Umami
  }, stubNow);
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE + '/' + path + '/'); return { page, errors };
}
// 1. Ловит ошибку, промис и не загрузившийся скрипт; лимит 3; очередь до появления Umami
{
  const { page } = await open('resize-image', false);
  await page.evaluate(() => { setTimeout(() => { throw new Error('boom-test'); }); Promise.reject(new Error('reject-test')); const s = document.createElement('script'); s.src = '/assets/nope.js'; document.head.append(s); });
  await page.waitForTimeout(1500);
  ok((await page.evaluate(() => window.__ev.length)) === 0, 'до загрузки Umami события копятся в очереди');
  await page.waitForTimeout(3000);
  const ev = (await page.evaluate(() => window.__ev)).filter(([n]) => n === 'js-error').map(([, d]) => d);
  ok(ev.length === 3, `js-error x3: ${JSON.stringify(ev)}`);
  ok(ev.some((d) => /boom-test/.test(d.msg) && d.path === '/resize-image/') && ev.some((d) => /reject-test/.test(d.msg)) && ev.some((d) => /script load failed/.test(d.msg) && /nope\.js/.test(d.src)), 'ошибка, промис и скрипт распознаны');
  await page.evaluate(() => { setTimeout(() => { throw new Error('fourth'); }); });
  await page.waitForTimeout(500);
  ok((await page.evaluate(() => window.__ev.filter(([n]) => n === 'js-error').length)) === 3, 'больше 3 на визит не шлёт');
}
// 2. Дымовой прогон: ни одной js-error и pageerror при загрузке страниц
for (const p of PAGES) {
  const { page, errors } = await open(p);
  await page.waitForTimeout(2500);
  const je = (await page.evaluate(() => window.__ev)).filter(([n]) => n === 'js-error');
  ok(je.length === 0 && errors.length === 0, `/${p}/ чисто${je.length ? ' ' + JSON.stringify(je) : ''}${errors.length ? ' ' + errors.join('|') : ''}`);
  await page.close();
}
await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
