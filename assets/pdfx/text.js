// PDF → TXT на странице /pdf-to-text/ (30.10.2026). pdf.js тот же, что у конвертера в Excel (assets/pdfx).
// Текст собирается построчно: элементы страницы группируются по высоте строки и сортируются слева направо.
// Файл не покидает браузер.
import * as pdfjsLib from './pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.min.mjs', import.meta.url).href;

const $ = (id) => document.getElementById(id);
const drop = $('ptx-drop');
const input = $('ptx-file');
const out = $('ptx-text');
const states = ['ptx-idle', 'ptx-busy', 'ptx-done', 'ptx-scan', 'ptx-error'];
let fileName = 'document';

function show(id) { states.forEach((s) => { $(s).hidden = s !== id; }); }
function track(name, data) { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); }

function pageText(items) {
  const rows = [];
  for (const it of items) {
    if (!it.str) continue;
    const y = it.transform[5];
    const h = Math.abs(it.transform[3]) || it.height || 10;
    let row = rows.find((r) => Math.abs(r.y - y) < h * 0.5);
    if (!row) { row = { y, h, parts: [] }; rows.push(row); }
    row.parts.push({ x: it.transform[4], w: it.width, s: it.str });
  }
  rows.sort((a, b) => b.y - a.y);
  return rows.map((r) => {
    r.parts.sort((a, b) => a.x - b.x);
    let line = '';
    let end = null;
    for (const p of r.parts) {
      // Пробел, если между кусками заметный зазор и ни один из них сам не кончается/не начинается пробелом
      if (end !== null && p.x - end > r.h * 0.2 && !/\s$/.test(line) && !/^\s/.test(p.s)) line += ' ';
      line += p.s;
      end = p.x + p.w;
    }
    return line.replace(/\s+$/, '');
  }).join('\n');
}

async function convert(file) {
  fileName = (file.name || 'document').replace(/\.pdf$/i, '');
  $('ptx-name').textContent = file.name;
  show('ptx-busy');
  const t0 = Date.now();
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (err) {
    const locked = err && err.name === 'PasswordException';
    $('ptx-error-text').textContent = locked
      ? 'This PDF is password-protected. Open it, save a copy without a password, and try again.'
      : "We couldn't read this file. Make sure it's a real PDF, not a damaged or renamed file.";
    show('ptx-error');
    track('ptx-convert', { result: locked ? 'locked' : 'error' });
    return;
  }
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    pages.push(pageText((await page.getTextContent()).items));
    $('ptx-status').textContent = `Reading page ${i} of ${pdf.numPages}…`;
  }
  const n = pdf.numPages;
  await pdf.destroy();
  const text = pages.join('\n\n').trim();
  if (text.replace(/\s/g, '').length < 20) {
    show('ptx-scan');
    track('ptx-convert', { result: 'scan', pages: n });
    return;
  }
  out.value = text;
  const words = text.split(/\s+/).length;
  $('ptx-summary').textContent = `${n} page${n === 1 ? '' : 's'}, ${words.toLocaleString('en-US')} words. Edit if needed, then copy or download.`;
  show('ptx-done');
  track('ptx-convert', { result: 'ok', pages: n, secs: Math.round((Date.now() - t0) / 1000) });
}

function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    $('ptx-error-text').textContent = 'This tool takes PDF files. For a photo or screenshot of text, use our image to text converter.';
    show('ptx-error');
    track('ptx-convert', { result: 'not-pdf' });
    return;
  }
  convert(file);
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.querySelectorAll('.ptx-again').forEach((b) => b.addEventListener('click', () => { show('ptx-idle'); input.click(); }));
$('ptx-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(out.value); } catch { out.select(); document.execCommand('copy'); }
  $('ptx-copy').textContent = 'Copied';
  setTimeout(() => { $('ptx-copy').textContent = 'Copy all'; }, 1500);
  track('ptx-copy');
});
$('ptx-txt').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([out.value], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  track('ptx-download');
});
