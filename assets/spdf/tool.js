// Searchable PDF на странице /make-pdf-searchable/ (30.10): скан-PDF → OCR (tesseract.js) → тот же PDF
// с невидимым текстом поверх картинки. Страницы исходника не перерисовываем (качество и размер как были),
// страницы, где текст уже есть, не трогаем. Текст кладём шрифтом Noto Sans (латиница + кириллица,
// поэтому в списке языков нет CJK/арабского), pdf-lib + fontkit. Всё в браузере, файл не уходит.
import * as pdfjsLib from '../pdfx/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../pdfx/pdf.worker.min.mjs', import.meta.url).href;
const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
const MAX_PAGES = 50;
const MAX_MB = 100;

const $ = (id) => document.getElementById(id);
const drop = $('spdf-drop');
const input = $('spdf-file');
const lang = $('spdf-lang');
const states = ['spdf-idle', 'spdf-busy', 'spdf-done', 'spdf-error'];
let worker = null;
let workerLang = null;
let cancelled = false;
let busy = false;
let lastUrl = null;
let pageNote = '';
let cancelRun = null;

const show = (id) => states.forEach((s) => { $(s).hidden = s !== id; });
const track = (name, data) => { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); };

function loadScript(src, ready) {
  if (ready()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('script'));
    document.head.appendChild(s);
  });
}

// Вызовы встают в очередь: прогрев и распознавание не создают двух воркеров.
let queue = Promise.resolve();
function getWorker(code) {
  queue = queue.catch(() => {}).then(() => makeWorker(code));
  return queue;
}
async function makeWorker(code) {
  await loadScript(TESS, () => window.Tesseract);
  if (!worker) {
    worker = await window.Tesseract.createWorker(code, 1, {
      logger: (m) => {
        if (!busy) return;
        $('spdf-status').textContent = m.status === 'recognizing text'
          ? `${pageNote}: reading text… ${Math.round((m.progress || 0) * 100)}%`
          : 'Loading the text reader (first time only)…';
      },
    });
  } else if (workerLang !== code) {
    await worker.reinitialize(code);
  }
  workerLang = code;
  return worker;
}

function stopWorker() {
  try { worker?.terminate(); } catch { /* уже остановлен */ }
  worker = null;
  workerLang = null;
}

function fail(msg, data) {
  busy = false;
  $('spdf-error-text').textContent = msg;
  show('spdf-error');
  track('spdf-run', data);
}

// Слова Tesseract (координаты картинки) → невидимый текст в системе координат страницы PDF.
// convertToPdfPoint учитывает и поворот страницы, и смещение CropBox.
function placeWords(page, viewport, words, font) {
  let placed = 0;
  for (const w of words) {
    const text = (w.text || '').trim();
    if (!text) continue;
    const by = w.baseline && w.baseline.has_baseline !== false && w.baseline.y0 > w.bbox.y0 ? (w.baseline.y0 + w.baseline.y1) / 2 : w.bbox.y1;
    const [ax, ay] = viewport.convertToPdfPoint(w.bbox.x0, by);
    const [bx, bly] = viewport.convertToPdfPoint(w.bbox.x1, by);
    const len = Math.hypot(bx - ax, bly - ay);
    let unit;
    try { unit = font.widthOfTextAtSize(text, 1); } catch { continue; }
    if (!(unit > 0) || !(len > 0)) continue;
    const angle = Math.atan2(bly - ay, bx - ax) * 180 / Math.PI;
    try {
      page.drawText(text, { x: ax, y: ay, size: len / unit, font, opacity: 0, rotate: window.PDFLib.degrees(angle) });
      placed++;
    } catch { /* символ, которого нет в шрифте: пропускаем слово */ }
  }
  return placed;
}

const wordsOf = (data) => (data.blocks || []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words)));

async function run(file) {
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    return fail('This tool takes PDF files. For a photo or screenshot, use our image to text converter.', { result: 'not-pdf' });
  }
  if (file.size > MAX_MB * 1048576) return fail(`This PDF is over ${MAX_MB} MB, too big to process in a browser tab.`, { result: 'too-big' });
  busy = true;
  cancelled = false;
  // terminate() не обязан отклонить начатый recognize: ждём его вместе с отменой.
  const cancelP = new Promise((_, reject) => { cancelRun = () => reject(new Error('cancelled')); });
  cancelP.catch(() => {});
  const started = Date.now();
  const code = lang.value;
  $('spdf-name').textContent = file.name;
  $('spdf-status').textContent = 'Opening the PDF…';
  $('spdf-bar').value = 0;
  show('spdf-busy');
  const bytes = new Uint8Array(await file.arrayBuffer());
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  } catch (err) {
    const locked = err && err.name === 'PasswordException';
    return fail(locked ? 'This PDF is password-protected. Open it, save a copy without a password, and try again.'
      : "We couldn't read this file. Make sure it's a real PDF, not a damaged or renamed file.", { result: locked ? 'locked' : 'error' });
  }
  const n = pdf.numPages;
  if (n > MAX_PAGES) {
    await pdf.destroy();
    return fail(`This PDF has ${n} pages. The free tool handles up to ${MAX_PAGES} pages at a time: split it first.`, { result: 'too-many', pages: n });
  }
  let doc;
  let font;
  try {
    await loadScript('/assets/spdf/pdf-lib.min.js', () => window.PDFLib);
    await loadScript('/assets/spdf/fontkit.umd.min.js', () => window.fontkit);
    doc = await window.PDFLib.PDFDocument.load(bytes);
    doc.registerFontkit(window.fontkit);
    font = await doc.embedFont(await (await fetch('/assets/spdf/NotoSans-Regular.ttf')).arrayBuffer(), { subset: true });
  } catch (err) {
    await pdf.destroy();
    return fail("This PDF's structure can't be edited in the browser (it may be encrypted or damaged).", { result: 'error', pages: n, err: String(err?.message || err).slice(0, 40) });
  }
  let ocrPages = 0;
  let keptPages = 0;
  let words = 0;
  try {
    for (let i = 1; i <= n; i++) {
      if (cancelled) throw new Error('cancelled');
      pageNote = `Page ${i} of ${n}`;
      $('spdf-status').textContent = `${pageNote}…`;
      const p = await pdf.getPage(i);
      const chars = (await p.getTextContent()).items.reduce((s, it) => s + it.str.trim().length, 0);
      if (chars > 20) { keptPages++; p.cleanup(); $('spdf-bar').value = i / n; continue; }
      // ~2000 px по длинной стороне: Tesseract читает уверенно, память вкладки в норме.
      const base = p.getViewport({ scale: 1 });
      const scale = Math.min(3, 2000 / Math.max(base.width, base.height));
      const vp = p.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await p.render({ canvasContext: ctx, viewport: vp }).promise;
      const w = await Promise.race([getWorker(code), cancelP]);
      if (cancelled) throw new Error('cancelled');
      const { data } = await Promise.race([w.recognize(canvas, {}, { blocks: true }), cancelP]);
      words += placeWords(doc.getPage(i - 1), vp, wordsOf(data), font);
      ocrPages++;
      canvas.width = canvas.height = 0;
      p.cleanup();
      $('spdf-bar').value = i / n;
    }
  } catch (err) {
    await pdf.destroy();
    if (cancelled) { busy = false; show('spdf-idle'); track('spdf-run', { result: 'cancel', pages: n }); return; }
    stopWorker();
    return fail("The text reader stopped. Check your connection and try again.", { result: 'error', pages: n, err: String(err?.message || err).slice(0, 40) });
  }
  await pdf.destroy();
  if (!ocrPages) {
    busy = false;
    $('spdf-done-title').textContent = 'This PDF is already searchable';
    $('spdf-summary').textContent = `All ${n} page${n === 1 ? '' : 's'} already have text you can search and copy, nothing to add.`;
    $('spdf-dl').hidden = true;
    show('spdf-done');
    track('spdf-run', { result: 'already', pages: n });
    return;
  }
  const out = new Blob([await doc.save()], { type: 'application/pdf' });
  const name = `${file.name.replace(/\.pdf$/i, '') || 'document'}-searchable.pdf`;
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(out);
  const dl = $('spdf-dl');
  dl.href = lastUrl;
  dl.download = name;
  dl.hidden = false;
  dl.textContent = `Download again · ${(out.size / 1048576).toFixed(1)} MB`;
  dl.click();
  busy = false;
  const secs = Math.round((Date.now() - started) / 1000);
  $('spdf-done-title').textContent = `${name} is in your Downloads`;
  $('spdf-summary').textContent = `${words} words added on ${ocrPages} scanned page${ocrPages === 1 ? '' : 's'}${keptPages ? `, ${keptPages} page${keptPages === 1 ? ' already had text and was' : 's already had text and were'} left as is` : ''}. Open it and press Ctrl+F to search.`;
  show('spdf-done');
  track('spdf-run', { result: words ? 'ok' : 'nowords', pages: n, ocrPages, words, lang: code, secs, sizeMb: Math.round(file.size / 1048576) });
}

function pick(files) {
  const file = files && files[0];
  if (file && !busy) run(file);
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
$('spdf-cancel').addEventListener('click', () => { cancelled = true; cancelRun?.(); stopWorker(); });
document.querySelectorAll('.spdf-again').forEach((b) => b.addEventListener('click', () => { show('spdf-idle'); input.click(); }));
$('spdf-dl').addEventListener('click', (e) => { if (e.isTrusted) track('spdf-download'); });
// Прогрев движка, пока человек выбирает файл.
let warmed = false;
['pointerdown', 'dragenter'].forEach((t) => drop.addEventListener(t, () => { if (!warmed) { warmed = true; getWorker(lang.value).catch(stopWorker); } }));
