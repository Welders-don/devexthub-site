// e2e страницы /mkv-to-mp4/ (виджет MOV-движка в режиме data-kind="mkv"). Файлы делает ffmpeg.
// Запуск: BASE=http://localhost:<порт>/mkv-to-mp4/ node tools/e2e_mkv_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import { execSync } from 'child_process';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8090/mkv-to-mp4/';
const TMP = '/tmp/mkv-e2e';
const SHOTS = new URL('../releases/mkv-page/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
const ff = (args) => execSync(`ffmpeg -loglevel error -y ${args}`);
const src = '-f lavfi -i testsrc=size=640x360:rate=25 -f lavfi -i sine=frequency=440';
ff(`${src} -f lavfi -i sine=frequency=880 -t 5 -map 0 -map 1 -map 2 -c:v libx264 -pix_fmt yuv420p -c:a:0 aac -c:a:1 ac3 -metadata:s:a:0 language=eng -metadata:s:a:1 language=rus -metadata:s:a:1 title=Dub ${TMP}/dual.mkv`);
ff(`${src} -t 5 -c:v libx264 -pix_fmt yuv420p -c:a aac ${TMP}/aac.mkv`);
ff(`${src} -t 5 -c:v libx264 -pix_fmt yuv420p -c:a ac3 ${TMP}/ac3.mkv`);
const probe = (f) => execSync(`ffprobe -v error -show_entries stream=codec_type,codec_name:stream_tags=language -of csv=p=0 ${f}`).toString().trim().split('\n').join(' | ');

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
const settled = (page) => page.waitForSelector('#mvt-done:not([hidden]), #mvt-error:not([hidden])', { timeout: 120000 });

// 1-2. Две дорожки: выбор показан; оставляем русскую AC-3, затем английскую AAC
for (const [pick, wantCodec] of [['rus', 'ac3'], ['eng', 'aac']]) {
  const { page, errors } = await openPage();
  await page.setInputFiles('#mvt-file', `${TMP}/dual.mkv`);
  await page.waitForSelector('#mvt-opts:not([hidden])', { timeout: 30000 });
  const labels = await page.$$eval('#mvt-tracks label', (ls) => ls.map((l) => l.textContent.trim()));
  if (pick === 'rus') {
    ok(labels.length === 2, `дорожки: ${JSON.stringify(labels)}`);
    await page.screenshot({ path: `${SHOTS}/desktop-opts.png` });
  }
  await page.locator('#mvt-tracks label', { hasText: pick === 'rus' ? 'Russian' : 'English' }).locator('input').check();
  const aacDisabled = await page.locator('#mvt-aac').isDisabled();
  const note = await page.textContent('#mvt-aac-note');
  const dl = page.waitForEvent('download', { timeout: 60000 });
  await page.click('#mvt-go');
  await settled(page);
  const d = await dl;
  const out = `${TMP}/out-${pick}.mp4`; await d.saveAs(out);
  const streams = probe(out);
  ok(streams.includes(`${wantCodec},audio`) && (streams.match(/audio/g) || []).length === 1, `${pick}: в MP4 одна дорожка ${wantCodec}: ${streams}`);
  const warn = await page.locator('#mvt-warn').isVisible() ? await page.textContent('#mvt-warn') : '';
  if (pick === 'rus') ok(/AC3/.test(warn) && !/without sound/.test(warn), `rus: предупреждение про AC-3, без «без звука» (AAC-галка disabled=${aacDisabled}: ${note}): ${warn}`);
  else ok(!/without sound/.test(warn), `eng: без ложного «без звука»: «${warn}»`);
  const ev = await page.evaluate(() => window.__ev);
  ok(ev.some(([n]) => n === 'mkv-options') && ev.some(([n, x]) => n === 'mkv-run' && /ok|warn/.test(x.result)), 'события mkv-options / mkv-run');
  ok(errors.length === 0, `${pick}: без ошибок JS ${errors.join(' | ')}`);
}

// 3. Одна AAC-дорожка: выбора нет, сразу конвертация
{
  const { page } = await openPage();
  const dl = page.waitForEvent('download', { timeout: 60000 });
  await page.setInputFiles('#mvt-file', `${TMP}/aac.mkv`);
  await settled(page);
  const d = await dl; const out = `${TMP}/out-aac.mp4`; await d.saveAs(out);
  ok(probe(out).includes('aac,audio'), `одна AAC: без шага выбора, ${probe(out)}`);
  const href = await page.getAttribute('#mvt-done a.store-link', 'href');
  ok(/utm_content=mkv-widget/.test(href) && /utm_campaign=mkv-to-mp4/.test(href), `ссылка в стор: ${href.split('?')[1]}`);
}

// 4. Одна AC-3: выбор показан (звук не для телефонов)
{
  const { page } = await openPage();
  await page.setInputFiles('#mvt-file', `${TMP}/ac3.mkv`);
  await page.waitForSelector('#mvt-opts:not([hidden])', { timeout: 30000 });
  ok(true, `одна AC-3: шаг выбора показан, «${await page.textContent('#mvt-aac-note')}»`);
}

// 5. Мобильный
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
