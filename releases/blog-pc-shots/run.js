// Прогон живой Extract Text from Image 1.2.7 (распакована в ./ext) в полном Chromium под xvfb.
// Запуск: см. NOTES.md. Сервер: python3 -m http.server 8771 из корня Devexthub-site.
// Телеметрия расширения глушится --host-resolver-rules (devexthub.com -> ~NOTFOUND).
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/client/projects/JobAgent/node_modules/playwright');

const DIR = __dirname;
const EXT = path.join(DIR, 'ext');
const RAW = path.join(DIR, 'raw');
const PORT = 8771;
const BASE = `http://127.0.0.1:${PORT}`;
const RECEIPT = `${BASE}/releases/blog-pc-shots/receipt.png`;
const SLIDE = `${BASE}/assets/sample-slide-text.png`;
const PDF = `${BASE}/releases/pdf-samples/bank-statement-sample.pdf`;
const PROFILE = process.argv[2] || '/tmp/et-blog-profile';
const SESSION = process.argv[3] || '1';
fs.mkdirSync(RAW, { recursive: true });

const TRUTH = {
  receipt: `HARBOR LANE SUPPLY CO.
214 Harbor Lane, Unit 3
Receipt #A-20481 Oct 2, 2026 14:37
Item Qty Price
Cotton work gloves, size L 2 $14.98
Masking tape 48 mm x 50 m 3 $11.37
Drill bit set, 21 pieces 1 $27.50
LED bulb 9W warm white 4 $15.96
Subtotal $69.81
Sales tax 8.25% $5.76
Total $75.57
Thank you! Returns accepted within 30 days with this receipt.`,
  slide: `Q3 LOGISTICS REVIEW
Warehouse throughput up 18 percent after the
new picking route rolled out in May.
Average order cycle time: 41 hours
Returns processed same day: 92 percent
Damaged in transit: 0.7 percent of volume
Two sites still run the old scanner firmware
Source: internal ops dashboard, week 39`,
};

function lev(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function accuracy(got, truth) {
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const g = norm(got), t = norm(truth);
  const gw = g.split(' '), tw = t.split(' ');
  return {
    charErrors: lev(g, t), chars: t.length,
    wordErrors: lev(gw, tw), words: tw.length,
  };
}

const HOOK = () => {
  const m = (window.__m = { up: null, done: null, text: null, err: null, sawDownload: false, sawEngineHint: false, sawLoading: false });
  document.addEventListener('mouseup', () => { if (m.up === null) m.up = performance.now(); }, true);
  const mo = new MutationObserver(() => {
    const h = document.getElementById('ext-ocr-hint-slow');
    if (h && h.dataset.downloading) m.sawDownload = true;
    if (h && h.textContent && !h.dataset.downloading) m.sawEngineHint = true;
    if (m.done || m.up === null) return;
    if (document.querySelector('#ext-ocr-panel .ext-ocr-loading')) m.sawLoading = true;
    if (!m.sawLoading) return; // старая панель от прошлого прогона не считается
    const pre = document.querySelector('#ext-ocr-panel .ext-ocr-text');
    const err = document.querySelector('#ext-ocr-panel .ext-ocr-err');
    if (pre) { m.done = performance.now(); m.text = pre.textContent; }
    else if (err) { m.done = performance.now(); m.err = err.textContent; }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
};

async function startSelection(popup, target, url) {
  await target.bringToFront();
  await popup.evaluate(async (u) => {
    const [t] = await chrome.tabs.query({ url: u });
    await chrome.runtime.sendMessage({ type: 'START_SELECTION', tabId: t.id });
  }, url);
}

async function measure(ctx, popup, target, { label, url, truth, shotSelect, shotResult, pad = 12 }) {
  await target.goto(url); // чистая страница: без панели прошлого прогона в кадре захвата
  await target.waitForTimeout(500);
  await startSelection(popup, target, url);
  await target.waitForSelector('#ext-ocr-sel', { timeout: 15000 });
  await target.waitForTimeout(900); // человек целится
  const box = await target.evaluate(() => { const r = document.querySelector('img').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await target.evaluate(HOOK);
  const x0 = box.x - pad, y0 = box.y - pad, x1 = box.x + box.w + pad, y1 = box.y + box.h + pad;
  await target.mouse.move(x0, y0);
  await target.mouse.down();
  await target.mouse.move(x1, y1, { steps: 20 });
  await target.waitForTimeout(250);
  if (shotSelect) await target.screenshot({ path: path.join(RAW, shotSelect) });
  await target.mouse.up();
  await target.waitForFunction(() => window.__m && window.__m.done, null, { timeout: 240000, polling: 50 });
  const m = await target.evaluate(() => window.__m);
  if (shotResult) { await target.waitForTimeout(500); await target.screenshot({ path: path.join(RAW, shotResult) }); }
  const ms = Math.round(m.done - m.up);
  const res = { label, ms, sawDownload: m.sawDownload, sawEngineHint: m.sawEngineHint, err: m.err, text: m.text };
  if (m.text && truth) res.acc = accuracy(m.text, truth);
  console.log(JSON.stringify(res));
  return res;
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
    env: { ...process.env, HOME: '/home/client/projects/Devexthub-site/.shots/chrome-home-et' },
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      '--disable-crash-reporter', '--disable-breakpad',
      '--host-resolver-rules=MAP devexthub.com ~NOTFOUND',
      '--lang=en-US',
    ],
  });
  let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker', { timeout: 20000 });
  const extId = new URL(sw.url()).host;
  console.log('extId', extId, 'session', SESSION);
  await new Promise((r) => setTimeout(r, 1500));
  for (const p of ctx.pages()) if (p.url().includes('onboarding.html')) { console.log('onboarding opened on install'); await p.close(); }

  const target = ctx.pages()[0] || await ctx.newPage();
  const popup = await ctx.newPage();
  await popup.goto(`chrome-extension://${extId}/popup.html`);
  const out = [];

  if (SESSION === '3') {
    // повторная выборка «первый OCR после установки» на свежем профиле
    out.push(await measure(ctx, popup, target, { label: 'receipt en #1 (first OCR after install, repeat)', url: RECEIPT, truth: TRUTH.receipt }));
    out.push(await measure(ctx, popup, target, { label: 'receipt en #2 (warm, repeat)', url: RECEIPT, truth: TRUTH.receipt }));
  } else if (SESSION === '1') {
    out.push(await measure(ctx, popup, target, { label: 'receipt en #1 (first OCR after install)', url: RECEIPT, truth: TRUTH.receipt, shotSelect: 'receipt-select.png', shotResult: 'receipt-result.png' }));

    // Copy all -> буфер обмена, Download -> имя файла
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    const labels = await target.$$eval('#ext-ocr-panel button', (bs) => bs.map((b) => b.textContent.trim()));
    console.log('panel buttons', JSON.stringify(labels));
    await target.click('#ext-ocr-panel .ext-ocr-copy');
    await target.waitForTimeout(400);
    const clip = await target.evaluate(() => navigator.clipboard.readText());
    const copyLabel = await target.$eval('#ext-ocr-panel .ext-ocr-copy', (b) => b.textContent);
    console.log('clipboard equals panel text:', clip === out[0].text, '| copy button now:', copyLabel);
    const [dl] = await Promise.all([target.waitForEvent('download'), target.click('#ext-ocr-panel .ext-ocr-footer button:nth-of-type(3)')]);
    console.log('download filename:', dl.suggestedFilename());

    out.push(await measure(ctx, popup, target, { label: 'receipt en #2 (warm)', url: RECEIPT, truth: TRUTH.receipt, shotResult: 'receipt-result-2.png' }));
    out.push(await measure(ctx, popup, target, { label: 'slide en #3 (warm)', url: SLIDE, truth: TRUTH.slide, shotSelect: 'slide-select.png', shotResult: 'slide-result.png', pad: -40 }));

    // PDF-вьюер Chrome: стартует ли оверлей
    await target.goto(PDF);
    await target.waitForTimeout(2500);
    await startSelection(popup, target, PDF);
    const sel = await target.waitForSelector('#ext-ocr-sel', { timeout: 8000 }).then(() => true).catch(() => false);
    console.log('pdf viewer: selection overlay appeared =', sel);
    await target.screenshot({ path: path.join(RAW, 'pdf-after-start.png') });
    if (sel) {
      await target.evaluate(HOOK);
      await target.mouse.move(300, 120); await target.mouse.down(); await target.mouse.move(980, 520, { steps: 15 }); await target.mouse.up();
      const ok = await target.waitForFunction(() => window.__m && window.__m.done, null, { timeout: 60000 }).then(() => true).catch(() => false);
      const m = await target.evaluate(() => window.__m);
      console.log('pdf ocr:', ok, JSON.stringify({ ms: m.done && Math.round(m.done - m.up), err: m.err, text: (m.text || '').slice(0, 300) }));
      await target.screenshot({ path: path.join(RAW, 'pdf-result.png') });
    }

    // Вкладка Upload File в попапе: локальный файл без открытия в браузере
    await popup.reload();
    await popup.click('.tab-btn[data-tab="upload"]');
    const t0 = Date.now();
    await popup.setInputFiles('#fileInput', path.join(DIR, 'receipt.png'));
    await popup.waitForFunction(() => { const r = document.getElementById('uploadResult'); return r.className === 'show' || r.className.includes('error'); }, null, { timeout: 120000 });
    const up = await popup.$eval('#uploadResult', (r) => r.textContent);
    const upBtns = await popup.$$eval('#uploadFooter button:not([hidden])', (bs) => bs.map((b) => b.textContent.trim()));
    console.log('upload tab:', Date.now() - t0, 'ms', JSON.stringify(accuracy(up, TRUTH.receipt)), 'buttons', JSON.stringify(upBtns));
  } else {
    out.push(await measure(ctx, popup, target, { label: 'slide en (first OCR after browser restart)', url: SLIDE, truth: TRUTH.slide, pad: -40 }));
    await popup.evaluate(() => chrome.storage.local.set({ lang: 'latin', langAuto: false }));
    out.push(await measure(ctx, popup, target, { label: 'receipt latin #1 (model not cached)', url: RECEIPT, truth: TRUTH.receipt }));
    out.push(await measure(ctx, popup, target, { label: 'receipt latin #2 (warm)', url: RECEIPT, truth: TRUTH.receipt }));
    // Повтор PDF: панель видна поверх PDF-вьюера после анимации?
    await target.goto(PDF); await target.waitForTimeout(2500);
    await startSelection(popup, target, PDF);
    await target.waitForSelector('#ext-ocr-sel', { timeout: 8000 });
    await target.evaluate(HOOK);
    await target.mouse.move(420, 100); await target.mouse.down(); await target.mouse.move(1150, 240, { steps: 15 }); await target.mouse.up();
    await target.waitForFunction(() => window.__m && window.__m.done, null, { timeout: 60000 });
    await target.waitForTimeout(1500);
    await target.screenshot({ path: path.join(RAW, 'pdf-result-2.png') });
    console.log('pdf panel opacity', await target.$eval('#ext-ocr-panel', (e) => getComputedStyle(e).opacity));
    console.log('cachedLangs', JSON.stringify(await popup.evaluate(() => chrome.storage.local.get('cachedLangs'))));
  }
  fs.writeFileSync(path.join(RAW, `results-session${SESSION}.json`), JSON.stringify(out, null, 2));
  await ctx.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
