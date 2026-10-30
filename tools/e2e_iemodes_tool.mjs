// e2e страниц режимов Image Enhancer: /ai-image-upscaler/ (2x по умолчанию, 4x) и /unblur-image/ (unblur по умолчанию).
// Запуск: SITE=http://localhost:<порт> node tools/e2e_iemodes_tool.mjs (нужна сеть: jsDelivr + модель)
import pw from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
import fs from 'fs';
const { chromium } = pw;
const SITE = process.env.SITE || 'http://localhost:8088';
const TMP = '/home/client/workspace/tmp/iem-e2e'; const SHOTS = new URL('../releases/ie-modes/', import.meta.url).pathname;
fs.mkdirSync(TMP, { recursive: true }); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++; };
const browser = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell' });
{ const p = await browser.newPage({ viewport: { width: 160, height: 120 } }); await p.setContent('<div style="width:160px;height:120px;background:linear-gradient(45deg,#c33,#36c);font:bold 30px Arial;color:#fff;display:flex;align-items:center;justify-content:center">IE</div>'); await p.screenshot({ path: `${TMP}/small.png` }); await p.close(); }
async function open(path, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage(); await page.route(/api\.devexthub\.com/, (r) => r.abort());
  await page.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d]) }; });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE + path); return { page, errors };
}
const size = (p) => { const b = fs.readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
async function runOnce(page, name) {
  await page.setInputFiles('#iew-file', `${TMP}/small.png`);
  await page.waitForSelector('#iew-done:not([hidden]), #iew-error:not([hidden])', { timeout: 300000 });
  const [d] = await Promise.all([page.waitForEvent('download'), page.click('#iew-dl')]);
  const p = `${TMP}/${name}.png`; await d.saveAs(p); return { wh: size(p), file: d.suggestedFilename(), meta: await page.textContent('#iew-meta') };
}
{
  const { page, errors } = await open('/ai-image-upscaler/');
  ok(await page.getAttribute('.iew-mode.on', 'data-mode') === 'upscale2x', 'апскейлер: по умолчанию 2x');
  const r = await runOnce(page, 'up2');
  ok(r.wh[0] === 320 && r.wh[1] === 240 && /upscale2x/.test(r.file), `2x: ${r.wh.join('×')} ${r.file} · ${r.meta}`);
  await page.screenshot({ path: `${SHOTS}/upscaler-done.png` });
  await page.click('.iew-again >> nth=0');
  await page.click('.iew-mode[data-mode="upscale4x"]');
  const r4 = await runOnce(page, 'up4');
  ok(r4.wh[0] === 640 && r4.wh[1] === 480, `4x: ${r4.wh.join('×')}`);
  const runs = (await page.evaluate(() => window.__ev)).filter(([n]) => n === 'ie-run').map(([, d]) => d.mode + ':' + d.result);
  ok(runs.join(',') === 'upscale2x:ok,upscale4x:ok', `события ie-run: ${runs}`);
  ok(/utm_campaign=ai-image-upscaler/.test(await page.getAttribute('#iew-done a.store-link', 'href')), 'UTM ai-image-upscaler');
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
{
  const { page, errors } = await open('/unblur-image/');
  ok(await page.getAttribute('.iew-mode.on', 'data-mode') === 'unblur', 'unblur: по умолчанию unblur');
  const r = await runOnce(page, 'unb');
  ok(r.wh[0] === 160 && r.wh[1] === 120 && /unblur/.test(r.file) && /^Unblur/.test(r.meta), `unblur: ${r.wh.join('×')} ${r.file} · ${r.meta}`);
  await page.screenshot({ path: `${SHOTS}/unblur-done.png` });
  ok(errors.length === 0, `без ошибок JS ${errors.join(' | ')}`);
}
{
  const { page } = await open('/image-enhancer/');
  ok(await page.getAttribute('.iew-mode.on', 'data-mode') === 'enhance', '/image-enhancer/: по умолчанию по-прежнему enhance');
}
for (const p of ['/ai-image-upscaler/', '/unblur-image/']) {
  const { page, errors } = await open(p, { width: 390, height: 844 });
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) && errors.length === 0, `${p} мобильный 390: без прокрутки и ошибок`);
}
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAIL` : '\nвсё OK'); process.exit(fails ? 1 : 0);
