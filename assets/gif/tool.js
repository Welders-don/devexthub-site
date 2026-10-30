// Видео → GIF на странице /video-to-gif/ (30.10.2026). Кадры достаёт Mediabunny (assets/mov/vendor, тот же,
// что у MOV-виджета), GIF собирает gifenc (MIT, assets/gif). Всё в браузере, видео не загружается.
import { Input, ALL_FORMATS, BlobSource, CanvasSink } from '../mov/vendor/mediabunny.min.mjs';
import { GIFEncoder, quantize, applyPalette } from './gifenc.esm.js';

const $ = (id) => document.getElementById(id);
const drop = $('gif-drop');
const input = $('gif-file');
const states = ['gif-idle', 'gif-opts', 'gif-busy', 'gif-done', 'gif-error'];
const MAX_SECONDS = 15;
let file = null;
let track = null;
let duration = 0;
let resultUrl = null;
let cancelled = false;

function show(id) { states.forEach((s) => { $(s).hidden = s !== id; }); }
function ev(name, data) { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); }
function fail(msg, data) { $('gif-error-text').textContent = msg; show('gif-error'); ev('gif-run', { result: 'error', ...data }); }
const kb = (n) => n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;

async function pick(files) {
  file = files && files[0];
  if (!file) return;
  try {
    const inp = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    track = await inp.getPrimaryVideoTrack();
    if (!track) return fail("There's no video track in this file.", { why: 'novideo' });
    duration = await inp.computeDuration();
    // HEVC без аппаратного декодера: тот же программный декодер, что у MOV-виджета.
    if (!(await track.canDecode()) && (await track.getCodec()) === 'hevc') {
      const { enableHevcFallback } = await import('../mov/app/hevc-fallback.js');
      enableHevcFallback();
    }
    if (!(await track.canDecode())) return fail("Your browser can't decode this video's format. Try converting it to MP4 first.", { why: 'codec' });
  } catch {
    return fail("This file can't be read as a video. It may be damaged or in a format the browser doesn't open.", { why: 'unreadable' });
  }
  $('gif-name').textContent = `${file.name} · ${duration.toFixed(1)} s`;
  $('gif-start').max = Math.max(0, Math.floor(duration - 1));
  $('gif-start').value = 0;
  $('gif-len').value = Math.min(5, Math.max(1, Math.floor(duration)));
  show('gif-opts');
  ev('gif-pick', { secs: Math.round(duration) });
  // Первый кадр как подсказка, что это то видео
  try {
    const sink = new CanvasSink(track, { width: 320 });
    const c = await sink.getCanvas(Math.min(0.1, duration / 2));
    if (c) { const pv = $('gif-thumb'); pv.width = c.canvas.width; pv.height = c.canvas.height; pv.getContext('2d').drawImage(c.canvas, 0, 0); }
  } catch { /* без превью тоже можно */ }
}

async function make() {
  const start = Math.max(0, Math.min(Number($('gif-start').value) || 0, Math.max(0, duration - 0.1)));
  const len = Math.min(MAX_SECONDS, Math.max(0.5, Number($('gif-len').value) || 3), duration - start);
  const fps = Number($('gif-fps').value);
  const width = Number($('gif-width').value);
  // Целым числом кадров: шаг 1/fps накапливал дробь и давал лишний кадр (51 вместо 50).
  const times = Array.from({ length: Math.max(1, Math.round(len * fps)) }, (_, i) => start + i / fps);
  cancelled = false;
  show('gif-busy');
  $('gif-bar').value = 0;
  const t0 = Date.now();
  try {
    const sink = new CanvasSink(track, { width, poolSize: 2 });
    const enc = GIFEncoder();
    const delay = Math.round(1000 / fps);
    let i = 0;
    for await (const c of sink.canvasesAtTimestamps(times)) {
      if (cancelled) throw new Error('cancelled');
      if (!c) continue;
      const { canvas } = c;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantize(data, 256);
      enc.writeFrame(applyPalette(data, palette), canvas.width, canvas.height, { palette, delay });
      i++;
      $('gif-bar').value = i / times.length;
      $('gif-status').textContent = `Making the GIF… frame ${i} of ${times.length}`;
      await new Promise((r) => setTimeout(r, 0));
    }
    enc.finish();
    const blob = new Blob([enc.bytes()], { type: 'image/gif' });
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(blob);
    $('gif-img').src = resultUrl;
    const base = (file.name || 'video').replace(/\.[^.]+$/, '');
    $('gif-dl').href = resultUrl;
    $('gif-dl').download = `${base}.gif`;
    $('gif-meta').textContent = `${i} frames · ${fps} fps · ${width} px wide · ${kb(blob.size)}`;
    show('gif-done');
    ev('gif-run', { result: 'ok', frames: i, fps, width, sizeKb: Math.round(blob.size / 1024), secs: Math.round((Date.now() - t0) / 1000) });
  } catch (err) {
    if (err.message === 'cancelled') { show('gif-opts'); ev('gif-run', { result: 'cancel' }); return; }
    fail('Making the GIF failed. Try a shorter clip or a smaller width.', { why: String(err.message).slice(0, 40) });
  }
}

input.addEventListener('change', () => { pick(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
$('gif-go').addEventListener('click', make);
$('gif-cancel').addEventListener('click', () => { cancelled = true; });
$('gif-again').addEventListener('click', () => show('gif-opts'));
document.querySelectorAll('.gif-new').forEach((b) => b.addEventListener('click', () => { show('gif-idle'); input.click(); }));
$('gif-dl').addEventListener('click', () => ev('gif-download'));
