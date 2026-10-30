// Яркость и цвет картинки (30.10.2026): /brighten-image/ (data-kind="brighten") и /change-image-color/
// (data-kind="recolor"). Canvas, без сети: картинка не покидает браузер. Правка идёт на превью (до 1200 px),
// при скачивании та же функция проходит по полному размеру.
const $ = (id) => document.getElementById(id);
const KIND = document.querySelector('.clr-tool').dataset.kind;
const drop = $('clr-drop');
const input = $('clr-file');
const canvas = $('clr-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const states = ['clr-idle', 'clr-opts', 'clr-error'];
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_MP = 40;
let bitmap = null;
let original = null; // ImageData превью без правок
let fileName = 'image';
let srcType = 'image/jpeg';
let timer = 0;
let edited = false;

const show = (id) => states.forEach((s) => { $(s).hidden = s !== id; });
const track = (name, data) => { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); };

// ---------- яркость: уровни (Auto) → гамма (яркость) → контраст, одной таблицей на 256 значений ----------
let levels = [0, 255];
function autoLevels(img) {
  const hist = new Uint32Array(256);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) hist[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8]++;
  const n = d.length / 4;
  let lo = 0; let hi = 255; let acc = 0;
  while (lo < 254 && (acc += hist[lo]) < n * 0.005) lo++;
  acc = 0;
  while (hi > lo + 1 && (acc += hist[hi]) < n * 0.005) hi--;
  return [lo, hi];
}
function brightLut() {
  const b = Number($('clr-b').value);
  const c = Number($('clr-c').value) * 2.55;
  const [lo, hi] = $('clr-auto').checked ? levels : [0, 255];
  const gamma = 1 + (b / 100) * 1.4;
  const f = (259 * (c + 255)) / (255 * (259 - c));
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    const x = Math.min(1, Math.max(0, (v - lo) / Math.max(1, hi - lo)));
    lut[v] = f * (255 * Math.pow(x, 1 / gamma) - 128) + 128;
  }
  return lut;
}
function brighten(img, lut) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = lut[d[i]]; d[i + 1] = lut[d[i + 1]]; d[i + 2] = lut[d[i + 2]]; }
}

// ---------- цвет: выбранный оттенок → новый, с сохранением теней (светлота сдвигается мягко) ----------
let picked = null; // [h, s, l]
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl2rgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
const hex2rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function recolor(img) {
  if (!picked) return;
  const all = $('clr-all').checked;
  const tol = Number($('clr-tol').value);
  const [hT, sT, lT] = rgb2hsl(...hex2rgb($('clr-new').value));
  const [h0, s0, l0] = picked;
  const sRatio = sT / Math.max(s0, 0.05);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
    let w = 1;
    if (!all) {
      if (s < 0.12) continue; // серое и белое не трогаем, иначе «перекрашивается» весь фон
      const dh = Math.abs(((h - h0 + 540) % 360) - 180);
      if (dh > tol) continue;
      w = dh < tol * 0.7 ? 1 : (tol - dh) / (tol * 0.3);
    }
    const nh = (hT + (h - h0) + 720) % 360;
    const ns = Math.min(1, s * sRatio);
    const nl = Math.min(1, Math.max(0, l + (lT - l0) * (all ? 0 : 0.8)));
    const [r, g, b] = hsl2rgb(nh, ns, nl);
    d[i] += (r - d[i]) * w; d[i + 1] += (g - d[i + 1]) * w; d[i + 2] += (b - d[i + 2]) * w;
  }
}

function apply(img) {
  if (KIND === 'brighten') brighten(img, brightLut());
  else recolor(img);
}

function render() {
  if (!original) return;
  const img = new ImageData(new Uint8ClampedArray(original.data), original.width, original.height);
  apply(img);
  ctx.putImageData(img, 0, 0);
  if (KIND === 'brighten') {
    $('clr-b-val').textContent = $('clr-b').value;
    $('clr-c-val').textContent = $('clr-c').value;
  } else {
    $('clr-tol-val').textContent = `${$('clr-tol').value}°`;
    $('clr-tol-wrap').hidden = $('clr-all').checked;
    $('clr-hint').textContent = picked ? '' : 'Click the color you want to change in the picture.';
  }
}
const schedule = () => { edited = true; clearTimeout(timer); timer = setTimeout(render, 30); };

async function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    $('clr-error-text').textContent = 'This takes image files: JPG, PNG or WEBP.';
    show('clr-error');
    track('clr-run', { kind: KIND, result: 'not-image' });
    return;
  }
  try { bitmap?.close(); bitmap = await createImageBitmap(file); } catch {
    $('clr-error-text').textContent = "This image can't be opened. It may be damaged or in a format the browser doesn't read.";
    show('clr-error');
    track('clr-run', { kind: KIND, result: 'bad-image' });
    return;
  }
  if (bitmap.width * bitmap.height > MAX_MP * 1e6) {
    $('clr-error-text').textContent = `This image is ${(bitmap.width * bitmap.height / 1e6).toFixed(0)} MP, too big for a browser tab. Resize it first.`;
    show('clr-error');
    track('clr-run', { kind: KIND, result: 'too-large' });
    return;
  }
  fileName = (file.name || 'image').replace(/\.[a-z0-9]+$/i, '');
  srcType = EXT[file.type] ? file.type : 'image/jpeg';
  const k = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (KIND === 'brighten') levels = autoLevels(original);
  picked = null;
  if (KIND === 'recolor') $('clr-swatch').style.background = 'transparent';
  edited = false;
  $('clr-src').textContent = `${file.name} · ${bitmap.width} × ${bitmap.height} px`;
  show('clr-opts');
  track('clr-pick', { kind: KIND, mp: Math.round(bitmap.width * bitmap.height / 1e5) / 10 });
  render();
}

// Клик по картинке = взять цвет (страница перекраски).
canvas.addEventListener('click', (e) => {
  if (KIND !== 'recolor' || !original) return;
  const r = canvas.getBoundingClientRect();
  const x = Math.min(original.width - 1, Math.floor((e.clientX - r.left) / r.width * original.width));
  const y = Math.min(original.height - 1, Math.floor((e.clientY - r.top) / r.height * original.height));
  const i = (y * original.width + x) * 4;
  const rgb = [original.data[i], original.data[i + 1], original.data[i + 2]];
  picked = rgb2hsl(...rgb);
  $('clr-swatch').style.background = `rgb(${rgb.join(',')})`;
  if (picked[1] < 0.12) $('clr-hint').textContent = 'That spot is grey, white or black. Pick a colored area, or tick "Change all colors".';
  schedule();
});

// «Удерживайте, чтобы сравнить»: показываем исходник, пока кнопка нажата.
const cmp = $('clr-compare');
cmp.addEventListener('pointerdown', () => { if (original) ctx.putImageData(original, 0, 0); });
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => cmp.addEventListener(t, render));

$('clr-dl').addEventListener('click', async () => {
  if (!bitmap) return;
  const btn = $('clr-dl');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const c = new OffscreenCanvas(bitmap.width, bitmap.height);
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(bitmap, 0, 0);
    const img = cx.getImageData(0, 0, c.width, c.height);
    apply(img);
    cx.putImageData(img, 0, 0);
    const blob = await c.convertToBlob({ type: srcType, quality: srcType === 'image/png' ? undefined : 0.92 });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${KIND === 'brighten' ? 'brightened' : 'recolored'}.${EXT[srcType]}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    track('clr-download', KIND === 'brighten'
      ? { kind: KIND, auto: $('clr-auto').checked, b: Number($('clr-b').value), c: Number($('clr-c').value) }
      : { kind: KIND, all: $('clr-all').checked, tol: Number($('clr-tol').value), picked: !!picked, edited });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download';
  }
});

document.querySelectorAll('#clr-opts input').forEach((el) => el.addEventListener('input', schedule));
input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.addEventListener('paste', (e) => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
  if (files.length) pick(files);
});
document.querySelectorAll('.clr-again').forEach((b) => b.addEventListener('click', () => { show('clr-idle'); input.click(); }));
