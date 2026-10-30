// e2e страницы /mov-to-mp3/. Запуск: BASE=http://localhost:<порт>/mov-to-mp3/ node tools/e2e_mp3_tool.mjs
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import { execSync } from 'child_process';
import fs from 'fs';
const { chromium } = pw;

const BASE = process.env.BASE || 'http://localhost:8088/mov-to-mp3/';
const TMP = '/home/client/workspace/tmp/mp3-e2e';
const SHOTS = new URL('../releases/mp3-page/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
const ff = (a) => execSync(`ffmpeg -loglevel error -y ${a}`);
ff(`-f lavfi -i testsrc=size=640x360:rate=30 -f lavfi -i sine=frequency=440:sample_rate=48000 -t 30 -c:v libx264 -pix_fmt yuv420p -c:a aac -ac 2 -shortest ${TMP}/clip.mov`);
ff(`-f lavfi -i testsrc=size=320x240:rate=30 -t 3 -c:v libx264 -pix_fmt yuv420p ${TMP}/silent.mp4`);
ff(`-f lavfi -i testsrc=size=320x240:rate=30 -f lavfi -i sine=frequency=300:sample_rate=48000 -t 10 -c:v libx264 -pix_fmt yuv420p -c:a libopus -ac 6 -shortest ${TMP}/surround.mkv`);
fs.writeFileSync(`${TMP}/notes.txt`, 'hello');
const probe = (p) => JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_name,codec_type,channels,sample_rate,bit_rate:format=duration -of json ${p}`));

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
async function convert(page, fileName, fmt, kbps) {
  await page.setInputFiles('#a2m-file', fileName);
  await page.waitForSelector('#a2m-opts:not([hidden]), #a2m-error:not([hidden])', { timeout: 30000 });
  if (await page.locator('#a2m-error').isVisible()) return { error: await page.textContent('#a2m-error-text') };
  await page.selectOption('#a2m-format', fmt);
  if (kbps) await page.selectOption('#a2m-kbps', String(kbps));
  const est = await page.textContent('#a2m-est');
  const t0 = Date.now();
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#a2m-go')]);
  const out = `${TMP}/out-${d.suggestedFilename()}`; await d.saveAs(out);
  await page.waitForSelector('#a2m-done:not([hidden])');
  return { out, name: d.suggestedFilename(), est, secs: ((Date.now() - t0) / 1000).toFixed(1) };
}

// 1. MOV (H.264 + AAC) → MP3 320, WAV; M4A по возможностям браузера
{
  const { page, errors } = await openPage();
  const r = await convert(page, `${TMP}/clip.mov`, 'mp3', 320);
  const p = probe(r.out); const a = p.streams[0];
  ok(p.streams.length === 1 && a.codec_name === 'mp3' && Math.abs(p.format.duration - 30) < 0.5 && Math.abs(a.bit_rate / 1000 - 320) < 10,
    `MOV → MP3: ${r.name} ${a.codec_name} ${Math.round(a.bit_rate / 1000)} kbps ${Number(p.format.duration).toFixed(2)} с за ${r.secs} с (оценка «${r.est}», файл ${Math.round(fs.statSync(r.out).size / 1024)} KB)`);
  const run = (await page.evaluate(() => window.__ev)).find(([n]) => n === 'mp3-run');
  ok(run && run[1].result === 'ok' && run[1].path === 'mp3' && run[1].kbps === 320, `событие mp3-run: ${JSON.stringify(run && run[1])}`);
  ok(await page.evaluate(() => new Promise((res) => { const a = document.getElementById('a2m-player'); if (a.readyState >= 1) res(a.duration > 29); else a.onloadedmetadata = () => res(a.duration > 29); setTimeout(() => res(false), 5000); })), 'плеер на странице играет результат');
  await page.screenshot({ path: `${SHOTS}/desktop-done.png` });
  await page.click('.a2m-new >> nth=1').catch(() => {});
  const w = await convert(page, `${TMP}/clip.mov`, 'wav');
  const pw2 = probe(w.out); const wa = pw2.streams[0];
  ok(wa.codec_name === 'pcm_s16le' && wa.channels === 2 && Number(wa.sample_rate) === 48000 && Math.abs(pw2.format.duration - 30) < 0.5,
    `MOV → WAV: ${wa.codec_name} ${wa.channels} ch ${wa.sample_rate} Гц ${Number(pw2.format.duration).toFixed(2)} с, kbps скрыт: ${await page.locator('#a2m-kbps-wrap').isHidden()}`);
  await page.click('.a2m-new >> nth=1').catch(() => {});
  await page.setInputFiles('#a2m-file', `${TMP}/clip.mov`);
  await page.waitForSelector('#a2m-opts:not([hidden])');
  const m4aOff = await page.locator('#a2m-format option[value="m4a"]').evaluate((o) => o.disabled);
  if (m4aOff) ok(true, `M4A на этом стенде выключен: «${await page.locator('#a2m-format option[value="m4a"]').textContent()}» (нет AAC-энкодера)`);
  else {
    const m = await convert(page, `${TMP}/clip.mov`, 'm4a');
    const pm = probe(m.out);
    ok(pm.streams.length === 1 && pm.streams[0].codec_name === 'aac', `MOV → M4A: ${pm.streams[0].codec_name}`);
  }
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}

// 2. MKV с 5.1 Opus → MP3 стерео; видео без звука; не-видео; отмена
{
  const { page, errors } = await openPage();
  const r = await convert(page, `${TMP}/surround.mkv`, 'mp3');
  const a = r.out ? probe(r.out).streams[0] : {};
  ok(a.codec_name === 'mp3' && a.channels === 2, `MKV 5.1 Opus → MP3: ${r.error || `${a.codec_name} ${a.channels} ch`}`);
  await page.click('.a2m-new >> nth=1').catch(() => {});
  const s = await convert(page, `${TMP}/silent.mp4`, 'mp3');
  ok(/no sound/.test(s.error || ''), `видео без звука → «${s.error}»`);
  const t = await convert(page, `${TMP}/notes.txt`, 'mp3');
  ok(/can't be read/.test(t.error || ''), `txt → «${t.error}»`);
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
{
  const { page } = await openPage();
  await page.setInputFiles('#a2m-file', `${TMP}/clip.mov`);
  await page.waitForSelector('#a2m-opts:not([hidden])');
  await page.selectOption('#a2m-format', 'wav');
  await page.click('#a2m-go');
  await page.click('#a2m-cancel').catch(() => {});
  await page.waitForSelector('#a2m-opts:not([hidden]), #a2m-done:not([hidden])', { timeout: 30000 });
  ok(true, `отмена: вернулись к ${await page.locator('#a2m-opts').isVisible() ? 'настройкам' : 'готовому (успел дойти)'}`);
}

// 3. Мобильный
{
  const { page, errors } = await openPage({ width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'мобильный 390: без горизонтальной прокрутки');
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/mobile-idle.png` });
  ok(errors.length === 0, 'мобильный: без ошибок JS');
}

await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK');
process.exit(fails ? 1 : 0);
