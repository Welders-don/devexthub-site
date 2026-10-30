// OCR прямо на странице /extract-text-from-image/.
// Движок = tesseract.js с jsDelivr (в расширении PaddleOCR, но это 40 МБ на первую загрузку).
// Картинка не покидает браузер: с CDN качаются только движок и языковые данные.
const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';

const $ = (id) => document.getElementById(id);
const drop = $('oxt-drop');
const input = $('oxt-file');
const lang = $('oxt-lang');
const out = $('oxt-text');
const states = ['oxt-idle', 'oxt-busy', 'oxt-done', 'oxt-empty', 'oxt-error'];
let worker = null;
let workerLang = null;
let lastImage = null;
let lastName = 'image';
let started = 0;

function show(id) {
  states.forEach((s) => { $(s).hidden = s !== id; });
}

function track(name, data) {
  if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
}

function loadScript() {
  if (window.Tesseract) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TESS;
    s.onload = resolve;
    s.onerror = () => reject(new Error('script'));
    document.head.appendChild(s);
  });
}

function progress(m) {
  const pct = Math.round((m.progress || 0) * 100);
  $('oxt-status').textContent = m.status === 'recognizing text'
    ? `Reading text… ${pct}%`
    : 'Loading the text reader (first time only)…';
}

// Вызовы встают в очередь: прогрев и распознавание не создают двух воркеров.
let queue = Promise.resolve();
function getWorker(code) {
  queue = queue.catch(() => {}).then(async () => {
    await loadScript();
    if (!worker) {
      worker = await window.Tesseract.createWorker(code, 1, { logger: progress });
    } else if (workerLang !== code) {
      await worker.reinitialize(code);
    }
    workerLang = code;
    return worker;
  });
  return queue;
}

// Прогрев: движок (~7 МБ) начинает качаться, пока человек выбирает файл.
// На телефоне выбор файла сам занимает 10-20 с, а загрузка 6-20 с.
let warmed = false;
function prewarm() {
  if (warmed) return;
  warmed = true;
  getWorker(lang.value).catch(() => { worker = null; workerLang = null; });
}
['pointerdown', 'focusin', 'dragenter'].forEach((t) => drop.addEventListener(t, prewarm));

// Дефолтный язык по языку браузера, если он есть в списке.
const nav = (navigator.language || 'en').slice(0, 2);
const match = lang.querySelector(`option[data-nav="${nav}"]`);
if (match) lang.value = match.value;

async function run() {
  const code = lang.value;
  $('oxt-name').textContent = lastName;
  $('oxt-status').textContent = 'Starting…';
  show('oxt-busy');
  started = Date.now();
  let text;
  let loaded;
  try {
    const w = await getWorker(code);
    loaded = Date.now();
    text = ((await w.recognize(lastImage)).data.text || '').trim();
  } catch (err) {
    worker = null;
    workerLang = null;
    show('oxt-error');
    track('ocr-run', { result: 'error', lang: code });
    return;
  }
  // secs = всё ожидание человека, load = сколько из него ждали движок, read = само распознавание.
  const timing = {
    secs: Math.round((Date.now() - started) / 1000),
    load: Math.round((loaded - started) / 1000),
    read: Math.round((Date.now() - loaded) / 1000),
  };
  if (!text) {
    show('oxt-empty');
    track('ocr-run', { result: 'empty', lang: code, ...timing });
    return;
  }
  out.value = text;
  const words = text.split(/\s+/).length;
  $('oxt-summary').textContent = `${words} word${words === 1 ? '' : 's'} found. Edit if needed, then copy or download.`;
  show('oxt-done');
  track('ocr-run', { result: 'ok', lang: code, ...timing });
}

function pick(files, via) {
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    $('oxt-error-text').textContent = 'This takes image files: PNG, JPG, WEBP, BMP or GIF. For a PDF, take a screenshot of the page first.';
    show('oxt-error');
    track('ocr-run', { result: 'not-image' });
    return;
  }
  lastImage = file;
  lastName = file.name || 'pasted image';
  track('ocr-pick', { via });
  run();
}

input.addEventListener('change', () => { pick(input.files, 'file'); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files, 'drop'));
document.addEventListener('paste', (e) => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
  if (files.length) pick(files, 'paste');
});
lang.addEventListener('change', () => { if (lastImage && $('oxt-busy').hidden) run(); });
document.querySelectorAll('.oxt-again').forEach((b) => b.addEventListener('click', () => input.click()));

$('oxt-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(out.value);
  } catch (e) {
    out.select();
    document.execCommand('copy');
  }
  $('oxt-copy').textContent = 'Copied';
  setTimeout(() => { $('oxt-copy').textContent = 'Copy all'; }, 1500);
  track('ocr-copy');
});

// Страница /image-to-word/ (30.10): главный выход — .docx (есть только там).
$('oxt-docx')?.addEventListener('click', async () => {
  const { buildDocx } = await import('./docx.js');
  const url = URL.createObjectURL(await buildDocx(out.value));
  const a = document.createElement('a');
  a.href = url;
  a.download = lastName.replace(/\.[a-z0-9]+$/i, '') + '.docx';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  track('ocr-download', { fmt: 'docx' });
});

$('oxt-txt').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([out.value], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = lastName.replace(/\.[a-z0-9]+$/i, '') + '.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  track('ocr-download', { fmt: 'txt' });
});
