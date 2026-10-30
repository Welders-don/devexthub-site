// e2e страницы /video-to-gif/. Запуск: BASE=http://localhost:<порт>/video-to-gif/ node tools/e2e_gif_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import { execSync } from 'child_process';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8088/video-to-gif/';
const TMP = '/tmp/gif-e2e';
const SHOTS = new URL('../releases/gif-page/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
execSync(`ffmpeg -loglevel error -y -f lavfi -i testsrc=size=1280x720:rate=30 -t 10 -c:v libx264 -pix_fmt yuv420p ${TMP}/clip.mp4`);
fs.writeFileSync(`${TMP}/notes.txt`, 'hello');
const HEVC = '/home/client/projects/Convertmovtomp4/test-videos/IMG_1002_hevc.mov';

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++; };
const browser = await chromium.launch({
  executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
});
async function openPage(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  return { page, errors };
}
const gifInfo = (p) => { const b = fs.readFileSync(p); return { sig: b.subarray(0, 6).toString(), w: b.readUInt16LE(6), h: b.readUInt16LE(8), kb: Math.round(b.length / 1024) }; };

// 1. MP4 → GIF 480 px, 10 fps, 5 с
{
  const { page, errors } = await openPage();
  await page.setInputFiles('#gif-file', `${TMP}/clip.mp4`);
  await page.waitForSelector('#gif-opts:not([hidden])', { timeout: 30000 });
  const t0 = Date.now();
  await page.click('#gif-go');
  await page.waitForSelector('#gif-done:not([hidden]), #gif-error:not([hidden])', { timeout: 180000 });
  const [d] = await Promise.all([page.waitForEvent('download'), page.click('#gif-dl')]);
  const out = `${TMP}/out.gif`; await d.saveAs(out);
  const g = gifInfo(out);
  ok(g.sig === 'GIF89a' && g.w === 480 && g.h === 270, `GIF ${g.w}×${g.h}, ${g.kb} KB за ${((Date.now() - t0) / 1000).toFixed(1)} с, имя ${d.suggestedFilename()}`);
  const run = (await page.evaluate(() => window.__ev)).find(([n]) => n === 'gif-run');
  ok(run && run[1].result === 'ok' && run[1].frames === 50, `событие gif-run: ${JSON.stringify(run && run[1])}`);
  await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 2. Айфонный HEVC MOV (на стенде без аппаратного декодера → программный)
{
  const { page, errors } = await openPage();
  await page.setInputFiles('#gif-file', HEVC);
  await page.waitForSelector('#gif-opts:not([hidden]), #gif-error:not([hidden])', { timeout: 60000 });
  await page.fill('#gif-len', '2');
  await page.selectOption('#gif-width', '320');
  await page.click('#gif-go');
  await page.waitForSelector('#gif-done:not([hidden]), #gif-error:not([hidden])', { timeout: 300000 });
  ok(await page.locator('#gif-done').isVisible(), `HEVC MOV → GIF: ${await page.textContent('#gif-meta')}`);
  ok(errors.length === 0, `HEVC: без ошибок JS ${errors.join(' | ')}`);
}

// 3. Отмена и не-видео
{
  const { page } = await openPage();
  await page.setInputFiles('#gif-file', `${TMP}/clip.mp4`);
  await page.waitForSelector('#gif-opts:not([hidden])');
  await page.fill('#gif-len', '15');
  await page.selectOption('#gif-fps', '15');
  await page.click('#gif-go');
  await page.waitForFunction(() => /frame [3-9]/.test(document.getElementById('gif-status').textContent), null, { timeout: 60000 });
  await page.click('#gif-cancel');
  await page.waitForSelector('#gif-opts:not([hidden])', { timeout: 30000 });
  ok(true, 'отмена возвращает к настройкам');
  await page.click('.gif-new >> nth=0').catch(() => {});
  await page.setInputFiles('#gif-file', `${TMP}/notes.txt`);
  await page.waitForSelector('#gif-error:not([hidden])', { timeout: 30000 });
  ok(/can't be read/.test(await page.textContent('#gif-error-text')), 'txt → понятная ошибка');
}

// 4. Мобильный
{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS');
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK');
process.exit(fails ? 1 : 0);
