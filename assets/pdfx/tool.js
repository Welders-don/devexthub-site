// Конвертер выписки на странице /pdf-to-excel/bank-statement/.
// Движок = копия расширения Convert PDF to Excel 1.1.1 (pdf-to-tables, xlsx-writer, csv-writer).
// Файл не покидает браузер: сервер здесь не участвует.
import * as pdfjsLib from './pdf.min.mjs';
import { analysisToSheets } from './pdf-to-tables.js';
import { buildXlsxBlob } from './xlsx-writer.js';
import { buildCsvBlob } from './csv-writer.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.min.mjs', import.meta.url).href;

const $ = (id) => document.getElementById(id);
const drop = $('bst-drop');
const input = $('bst-file');
const states = ['bst-idle', 'bst-busy', 'bst-done', 'bst-scan', 'bst-empty', 'bst-error'];
const PREVIEW_ROWS = 12;
let urls = [];

function show(id) {
  states.forEach((s) => { $(s).hidden = s !== id; });
}

function track(name, data) {
  if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
}

// Как analyzePdf в расширении, без ссылки на страницу pdf.js (линейный путь выключен).
async function analyze(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  let chars = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const vp = page.getViewport({ scale: 1 });
    const items = content.items.map((it) => ({
      text: it.str, x: it.transform[4], y: vp.height - it.transform[5],
      width: it.width, height: it.height, fontName: it.fontName,
    }));
    chars += items.reduce((s, it) => s + it.text.length, 0);
    pages.push({ pageNum: i, items, width: vp.width, height: vp.height });
  }
  const numPages = pdf.numPages;
  await pdf.destroy();
  return { numPages, pages, isDigital: chars > 50 };
}

// Все страницы на один лист через пустую строку, как в расширении по умолчанию.
function mergeSheets(sheets) {
  const grid = [];
  const sectionHeaderRows = [];
  for (const sh of sheets) {
    if (grid.length > 0) grid.push([]);
    const offset = grid.length;
    sh.grid.forEach((row) => grid.push(row));
    (sh.sectionHeaderRows || []).forEach((i) => sectionHeaderRows.push(offset + i));
  }
  return [{ name: 'Statement', grid, sectionHeaderRows }];
}

function renderPreview(grid) {
  const table = $('bst-preview');
  table.textContent = '';
  const cols = Math.max(...grid.map((r) => r.length));
  grid.slice(0, PREVIEW_ROWS).forEach((row) => {
    const tr = table.insertRow();
    for (let c = 0; c < cols; c++) tr.insertCell().textContent = row[c] ?? '';
  });
}

function setDownload(id, blob, filename, fmt) {
  const url = URL.createObjectURL(blob);
  urls.push(url);
  const a = $(id);
  a.href = url;
  a.download = filename;
  a.onclick = () => track('bst-download', { fmt });
}

async function convert(file) {
  urls.forEach((u) => URL.revokeObjectURL(u));
  urls = [];
  $('bst-name').textContent = file.name;
  show('bst-busy');
  let analysis;
  try {
    analysis = await analyze(file);
  } catch (err) {
    const locked = err && err.name === 'PasswordException';
    $('bst-error-text').textContent = locked
      ? 'This PDF is password-protected. Open it, save a copy without a password, and try again.'
      : "We couldn't read this file. Make sure it's a PDF downloaded from your bank, not a damaged or renamed file.";
    show('bst-error');
    track('bst-convert', { result: locked ? 'locked' : 'error' });
    return;
  }
  const pages = analysis.numPages;
  if (!analysis.isDigital) {
    show('bst-scan');
    track('bst-convert', { result: 'scan', pages });
    return;
  }
  const sheets = (await analysisToSheets(analysis)).filter((s) => s.grid.length > 0);
  if (sheets.length === 0) {
    show('bst-empty');
    track('bst-convert', { result: 'empty', pages });
    return;
  }
  const merged = mergeSheets(sheets);
  const base = file.name.replace(/\.pdf$/i, '') || 'statement';
  setDownload('bst-xlsx', await buildXlsxBlob(merged), `${base}.xlsx`, 'xlsx');
  setDownload('bst-csv', buildCsvBlob(merged), `${base}.csv`, 'csv');
  renderPreview(merged[0].grid);
  const rows = merged[0].grid.filter((r) => r.length > 0).length;
  $('bst-summary').textContent = `${pages} page${pages === 1 ? '' : 's'}, ${rows} rows. Preview of the first ${Math.min(PREVIEW_ROWS, rows)}:`;
  show('bst-done');
  track('bst-convert', { result: 'ok', pages });
}

function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    $('bst-name').textContent = file.name;
    $('bst-error-text').textContent = 'This tool takes PDF files. Download the statement from your online banking as PDF and drop it here.';
    show('bst-error');
    track('bst-convert', { result: 'not-pdf' });
    return;
  }
  convert(file);
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.querySelectorAll('.bst-again').forEach((b) => b.addEventListener('click', () => input.click()));
