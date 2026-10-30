// Изменить размер картинки на странице /resize-image/ (30.10.2026). Canvas, без сети: картинка не покидает браузер.
const $ = (id) => document.getElementById(id);
const drop = $('rsz-drop');
const input = $('rsz-file');
const states = ['rsz-idle', 'rsz-opts', 'rsz-error'];
let bitmap = null;
let fileName = 'image';
let srcType = 'image/jpeg';
let resultUrl = null;
let timer = 0;

function show(id) { states.forEach((s) => { $(s).hidden = s !== id; }); }
function track(name, data) { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); }
const kb = (n) => n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

async function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    $('rsz-error-text').textContent = 'This takes image files: JPG, PNG or WEBP.';
    show('rsz-error');
    track('rsz-run', { result: 'not-image' });
    return;
  }
  try { bitmap?.close(); bitmap = await createImageBitmap(file); } catch {
    $('rsz-error-text').textContent = "This image can't be opened. It may be damaged or in a format the browser doesn't read.";
    show('rsz-error');
    track('rsz-run', { result: 'bad-image' });
    return;
  }
  fileName = (file.name || 'image').replace(/\.[a-z0-9]+$/i, '');
  srcType = EXT[file.type] ? file.type : 'image/jpeg';
  $('rsz-format').value = srcType;
  $('rsz-src').textContent = `${file.name} · ${bitmap.width} × ${bitmap.height} px · ${kb(file.size)}`;
  $('rsz-w').value = bitmap.width;
  $('rsz-h').value = bitmap.height;
  $('rsz-pct').value = '100';
  show('rsz-opts');
  track('rsz-pick', { mp: Math.round(bitmap.width * bitmap.height / 1e5) / 10 });
  render();
}

// Пересчёт с небольшой задержкой: ползунок качества и поля дёргают render на каждый символ.
function schedule() { clearTimeout(timer); timer = setTimeout(render, 150); }

async function render() {
  if (!bitmap) return;
  const w = Math.max(1, Math.min(16000, Math.round(Number($('rsz-w').value) || 1)));
  const h = Math.max(1, Math.min(16000, Math.round(Number($('rsz-h').value) || 1)));
  const type = $('rsz-format').value;
  const q = Number($('rsz-q').value) / 100;
  $('rsz-q-wrap').style.display = type === 'image/png' ? 'none' : 'grid'; // у PNG качества нет
  $('rsz-q-val').textContent = `${Math.round(q * 100)}%`;
  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); } // у JPG нет прозрачности
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await c.convertToBlob({ type, quality: type === 'image/png' ? undefined : q });
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);
  $('rsz-preview').src = resultUrl;
  $('rsz-dl').href = resultUrl;
  $('rsz-dl').download = `${fileName}-${w}x${h}.${EXT[type]}`;
  $('rsz-out').textContent = `New image: ${w} × ${h} px · ${kb(blob.size)}`;
}

function keepRatio(changed) {
  if (!bitmap || !$('rsz-lock').checked) return;
  const r = bitmap.width / bitmap.height;
  if (changed === 'w') $('rsz-h').value = Math.max(1, Math.round(Number($('rsz-w').value) / r));
  else $('rsz-w').value = Math.max(1, Math.round(Number($('rsz-h').value) * r));
}

$('rsz-w').addEventListener('input', () => { keepRatio('w'); $('rsz-pct').value = ''; schedule(); });
$('rsz-h').addEventListener('input', () => { keepRatio('h'); $('rsz-pct').value = ''; schedule(); });
$('rsz-pct').addEventListener('change', () => {
  const p = Number($('rsz-pct').value);
  if (!p || !bitmap) return;
  $('rsz-w').value = Math.max(1, Math.round(bitmap.width * p / 100));
  $('rsz-h').value = Math.max(1, Math.round(bitmap.height * p / 100));
  schedule();
});
['rsz-format', 'rsz-q'].forEach((id) => $(id).addEventListener('input', schedule));
$('rsz-dl').addEventListener('click', () => track('rsz-download', { format: EXT[$('rsz-format').value], w: Number($('rsz-w').value), h: Number($('rsz-h').value) }));
input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.addEventListener('paste', (e) => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
  if (files.length) pick(files);
});
document.querySelectorAll('.rsz-again').forEach((b) => b.addEventListener('click', () => { show('rsz-idle'); input.click(); }));
