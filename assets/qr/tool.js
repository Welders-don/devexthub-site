// QR-код с картинки на странице /scan-qr-code-from-image/ (30.10.2026). Декодер jsQR 1.4.0 (Apache-2.0,
// assets/qr), грузится при первой картинке. Картинка не покидает браузер.
const $ = (id) => document.getElementById(id);
const drop = $('qr-drop');
const input = $('qr-file');
const states = ['qr-idle', 'qr-busy', 'qr-done', 'qr-none', 'qr-error'];
let lib = null;

function show(id) { states.forEach((s) => { $(s).hidden = s !== id; }); }
function track(name, data) { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); }

function loadLib() {
  if (lib) return lib;
  lib = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('./jsQR.min.js', import.meta.url).href;
    s.onload = () => (window.jsQR ? resolve(window.jsQR) : reject(new Error('no jsQR')));
    s.onerror = () => { lib = null; reject(new Error('load')); };
    document.head.appendChild(s);
  });
  return lib;
}

// Пробуем в нескольких масштабах: огромные фото jsQR читает хуже, мелкие скриншоты лучше увеличить.
function decodeAt(jsQR, bitmap, maxSide) {
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height)) || 1;
  const up = Math.max(bitmap.width, bitmap.height) < 300 ? 2 : 1;
  const w = Math.round(bitmap.width * k * up);
  const h = Math.round(bitmap.height * k * up);
  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = up === 1;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
}

const isUrl = (t) => /^https?:\/\/\S+$/i.test(t.trim());

async function pick(files) {
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    $('qr-error-text').textContent = 'This takes image files: a screenshot or a photo (PNG, JPG, WEBP).';
    show('qr-error');
    track('qr-scan', { result: 'not-image' });
    return;
  }
  show('qr-busy');
  let bitmap, jsQR;
  try {
    [bitmap, jsQR] = await Promise.all([createImageBitmap(file), loadLib()]);
  } catch (e) {
    $('qr-error-text').textContent = e.message === 'load' ? "The QR reader didn't load. Check your connection and try again." : "This image can't be opened.";
    show('qr-error');
    track('qr-scan', { result: 'error' });
    return;
  }
  let code = null;
  for (const side of [1200, 2400, 800, 600]) {
    code = decodeAt(jsQR, bitmap, side);
    if (code) break;
  }
  bitmap.close();
  if (!code || !code.data) {
    show('qr-none');
    track('qr-scan', { result: 'none' });
    return;
  }
  const text = code.data;
  $('qr-text').value = text;
  const link = $('qr-open');
  link.hidden = !isUrl(text);
  if (isUrl(text)) { link.href = text.trim(); $('qr-host').textContent = new URL(text.trim()).host; }
  $('qr-kind').textContent = isUrl(text) ? 'The QR code contains a link. Check the address before you open it:' : 'The QR code contains this text:';
  show('qr-done');
  track('qr-scan', { result: 'ok', kind: isUrl(text) ? 'url' : /^WIFI:/i.test(text) ? 'wifi' : 'text' });
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
document.addEventListener('paste', (e) => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
  if (files.length) pick(files);
});
document.querySelectorAll('.qr-again').forEach((b) => b.addEventListener('click', () => { show('qr-idle'); input.click(); }));
$('qr-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('qr-text').value); } catch { $('qr-text').select(); document.execCommand('copy'); }
  $('qr-copy').textContent = 'Copied';
  setTimeout(() => { $('qr-copy').textContent = 'Copy'; }, 1500);
  track('qr-copy');
});
$('qr-open').addEventListener('click', () => track('qr-open'));
