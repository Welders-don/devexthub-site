// Виджет Image Enhancer на /image-enhancer/ (30.10.2026). Движок = assets/ie/engine.js (копия расширения).
// Фото не покидает браузер: из сети только рантайм (jsDelivr) и модель 4.9 МБ (наш сервер), один раз.
// Движок работает в Web Worker (worker.js), страница остаётся живой и на медленном пути WASM.
const MAX_INPUT_PIXELS = 4 * 1024 * 1024; // как в engine.js
const newWorker = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
let worker = newWorker();
let abortRun = null;

const $ = (id) => document.getElementById(id);
const drop = $('iew-drop');
const input = $('iew-file');
const states = ['iew-idle', 'iew-busy', 'iew-done', 'iew-error'];
let mode = 'enhance';
let bitmap = null;
let fileName = 'image';
let busy = false;
let resultUrl = null;
let srcUrl = null;

function show(id) { states.forEach((s) => { $(s).hidden = s !== id; }); }
function track(name, data) { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); }
const LABEL = { enhance: 'Enhance', upscale2x: 'Upscale 2x', upscale4x: 'Upscale 4x', unblur: 'Unblur' };

function setMode(m) {
  mode = m;
  document.querySelectorAll('.iew-mode').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
}
document.querySelectorAll('.iew-mode').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

// Прогрев: рантайм и модель качаются, пока человек выбирает файл (как у OCR-виджета).
let warmed = false;
function prewarm() {
  if (warmed) return;
  warmed = true;
  worker.postMessage({ type: 'warm' });
}
['pointerdown', 'focusin', 'dragenter'].forEach((t) => drop.addEventListener(t, prewarm));

function fmtLeft(sec) {
  return sec < 60 ? `${Math.max(1, Math.round(sec))} s` : `${Math.round(sec / 60)} min`;
}

// Один прогон = одно сообщение воркеру; ответы download/progress/done/error.
function runInWorker(bm) {
  return new Promise((resolve, reject) => {
    abortRun = reject;
    worker.onmessage = ({ data }) => {
      if (data.type === 'download') {
        $('iew-status').textContent = `Downloading the AI model, one time only… ${Math.round((data.d / data.t) * 100)}%`;
      } else if (data.type === 'progress') {
        progress(data);
      } else if (data.type === 'done') {
        resolve(data);
      } else if (data.type === 'error') {
        reject(new Error(data.message));
      }
    };
    worker.postMessage({ type: 'run', bitmap: bm, mode, quality: 2 }, [bm]);
  });
}

let tiles0 = 0;
function progress({ d, t, backend }) {
  if (d === 0) { tiles0 = Date.now(); $('iew-slow').hidden = backend !== 'wasm'; }
  const left = d > 0 ? ((Date.now() - tiles0) / d) * (t - d) / 1000 : 0;
  $('iew-status').textContent = `${LABEL[mode]}: ${Math.round((d / t) * 100)}%` + (d > 0 && d < t ? ` · about ${fmtLeft(left)} left` : '');
  $('iew-bar').value = d / t;
}

async function run() {
  if (busy || !bitmap) return;
  busy = true;
  show('iew-busy');
  $('iew-slow').hidden = true;
  $('iew-status').textContent = 'Starting…';
  $('iew-bar').removeAttribute('value');
  const t0 = Date.now();
  tiles0 = 0;
  const mp = Math.round((bitmap.width * bitmap.height) / 1e5) / 10;
  try {
    // Копия: переданный воркеру bitmap отсоединяется, а он нужен для «Try 2x» на той же картинке.
    const { blob, backend } = await runInWorker(await createImageBitmap(bitmap));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(blob);
    $('iew-after').src = resultUrl;
    $('iew-before').src = srcUrl;
    $('iew-cut').value = 50;
    $('iew-after-wrap').style.clipPath = 'inset(0 0 0 50%)';
    const scale = mode === 'upscale4x' ? 4 : mode === 'upscale2x' ? 2 : 1;
    const base = fileName.replace(/\.[a-z0-9]+$/i, '');
    $('iew-dl').href = resultUrl;
    $('iew-dl').download = `${base}-${mode}.png`;
    $('iew-meta').textContent = `${LABEL[mode]} · ${bitmap.width * scale} × ${bitmap.height * scale} px · drag the slider to compare`;
    document.querySelectorAll('.iew-rerun').forEach((b) => { b.hidden = b.dataset.mode === mode; });
    show('iew-done');
    const secs = Math.round((Date.now() - t0) / 1000);
    track('ie-run', { result: 'ok', mode, mp, secs, load: Math.round(((tiles0 || Date.now()) - t0) / 1000), backend });
  } catch (err) {
    const msg = err?.message || '';
    if (msg === 'cancelled') { show('iew-idle'); track('ie-run', { result: 'cancel', mode, mp }); }
    else {
      $('iew-error-text').textContent = /model|fetch|network/i.test(msg)
        ? "The AI model didn't load. Check your connection and try again."
        : 'Your browser ran out of memory or the engine failed. Try a smaller image or Chrome on a computer.';
      show('iew-error');
      track('ie-run', { result: 'error', mode, mp, err: msg.slice(0, 40) });
    }
  } finally {
    busy = false;
  }
}

async function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    $('iew-error-text').textContent = 'This takes image files: JPG, PNG or WEBP.';
    show('iew-error');
    track('ie-run', { result: 'not-image' });
    return;
  }
  let bm;
  try { bm = await createImageBitmap(file); } catch {
    $('iew-error-text').textContent = "This image can't be opened. It may be damaged or in a format the browser doesn't read.";
    show('iew-error');
    track('ie-run', { result: 'bad-image' });
    return;
  }
  if (bm.width * bm.height > MAX_INPUT_PIXELS) {
    $('iew-error-text').textContent = `This image is ${(bm.width * bm.height / 1e6).toFixed(1)} MP. The enhancer works with photos up to 4 MP (about 2300 × 1700): that is exactly where small, blurry photos are. Resize it first, then upscale.`;
    show('iew-error');
    track('ie-run', { result: 'too_large', mp: Math.round(bm.width * bm.height / 1e5) / 10 });
    bm.close();
    return;
  }
  bitmap?.close();
  bitmap = bm;
  fileName = file.name || 'image';
  if (srcUrl) URL.revokeObjectURL(srcUrl);
  srcUrl = URL.createObjectURL(file);
  track('ie-pick', { mode });
  run();
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.addEventListener('paste', (e) => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
  if (files.length) pick(files);
});
// Отмена мгновенная: тайл на процессоре считается секундами, ждать его конца не надо.
// Воркер убиваем и поднимаем заново, модель уже в кэше браузера.
$('iew-cancel').addEventListener('click', () => {
  worker.terminate();
  worker = newWorker();
  warmed = false;
  abortRun?.(new Error('cancelled'));
});
$('iew-cut').addEventListener('input', (e) => { $('iew-after-wrap').style.clipPath = `inset(0 0 0 ${e.target.value}%)`; });
document.querySelectorAll('.iew-rerun').forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.mode); track('ie-rerun', { mode: b.dataset.mode }); run(); }));
document.querySelectorAll('.iew-again').forEach((b) => b.addEventListener('click', () => { show('iew-idle'); input.click(); }));
$('iew-dl').addEventListener('click', () => track('ie-download', { mode }));
