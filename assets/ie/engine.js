// Движок Image Enhancer для страницы /image-enhancer/ (30.10.2026).
// Копия логики extension/offscreen.js (Imageenhancer, live 1.1.3): та же модель Real-ESRGAN general x4v3,
// тайлы, самопроверка WebGPU с откатом на WASM, режимы и сила эффекта. Отличия от расширения:
// без chrome.*, рантайм с jsDelivr, WASM в один поток (на обычной странице без crossOriginIsolated
// SharedArrayBuffer нет). Правка движка в расширении сама сюда НЕ приедет.
const ORT_DIST = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/';
const MODEL_URLS = [
  'https://devexthub.com:8443/ie-assets/realesr-general-x4v3.onnx',
  'https://raw.githubusercontent.com/Welders-don/image-enhancer-assets/main/models/realesr-general-x4v3.onnx',
];
const MODEL_BYTES = 4871181;
const MODEL_CACHE = 'ie-site-model-v1';
const MODEL_CACHE_KEY = 'https://www.devexthub.com/ie-model-cache/realesr-general-x4v3';
const MODEL_SCALE = 4;
const TILE_WASM = 256;
const TILE_GPU = 512;
const OVERLAP = 16;
export const MAX_INPUT_PIXELS = 4 * 1024 * 1024;
const STRENGTH = { 1: 0.5, 2: 0.7, 3: 1 };
const TILE_FRACTIONS = [0.625, 0.875, 1];

let ort = null;
let session = null;
let sessionPromise = null;
export let backend = null;
let TILE = TILE_WASM;

async function loadOrt() {
  if (!ort) {
    ort = await import(ORT_DIST + 'ort.webgpu.min.mjs');
    ort.env.wasm.wasmPaths = ORT_DIST;
    ort.env.wasm.numThreads = 1;
  }
  return ort;
}

async function streamDownload(url, onDownload) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Model download failed (HTTP ${resp.status})`);
  const reader = resp.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onDownload(Math.min(received, MODEL_BYTES), MODEL_BYTES);
  }
  if (received !== MODEL_BYTES) throw new Error(`Model download corrupted: ${received} bytes`);
  const buf = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return buf;
}

async function loadModel(onDownload) {
  const cache = await caches.open(MODEL_CACHE).catch(() => null);
  const hit = cache && await cache.match(MODEL_CACHE_KEY);
  if (hit) return new Uint8Array(await hit.arrayBuffer());
  let lastErr = null;
  for (const url of MODEL_URLS) {
    try {
      const buf = await streamDownload(url, onDownload);
      try { await cache?.put(MODEL_CACHE_KEY, new Response(buf)); } catch { /* квота: в следующий раз скачаем снова */ }
      return buf;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Could not download the AI model');
}

async function probeOnce(s, size) {
  try {
    const data = new Float32Array(3 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i] = (i % size) / size;
      data[size * size + i] = Math.floor(i / size) / size;
      data[2 * size * size + i] = 0.5;
    }
    const out = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', data, [1, 3, size, size]) });
    const o = out[s.outputNames[0]].data;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < o.length; i++) {
      if (!Number.isFinite(o[i])) return 'nan';
      if (o[i] < min) min = o[i];
      if (o[i] > max) max = o[i];
    }
    return max - min > 0.01 ? 'ok' : 'flat';
  } catch {
    return 'throw';
  }
}

// Как в расширении: первый прогон 32x32 заодно прогрев, «flat» перепроверяем на размере тайла.
async function selfTest(s) {
  const first = await probeOnce(s, 32);
  if (first === 'ok') return true;
  if (first !== 'flat') return false;
  return (await probeOnce(s, TILE_GPU)) === 'ok';
}

async function createSession(onDownload) {
  await loadOrt();
  const modelBuf = await loadModel(onDownload);
  let hasGpu = false;
  try { hasGpu = !!(navigator.gpu && await navigator.gpu.requestAdapter()); } catch { /* нет адаптера */ }
  // NCHW первым: на Radeon дефолтный NHWC валил ядро Clip (опыт расширения).
  const eps = hasGpu
    ? [{ ep: { name: 'webgpu', preferredLayout: 'NCHW' }, tag: 'webgpu' }, { ep: 'webgpu', tag: 'webgpu' }, { ep: 'wasm', tag: 'wasm' }]
    : [{ ep: 'wasm', tag: 'wasm' }];
  let lastError = null;
  for (const { ep, tag } of eps) {
    try {
      const s = await ort.InferenceSession.create(modelBuf, { executionProviders: [ep] });
      if (tag === 'webgpu' && !(await selfTest(s))) continue;
      backend = tag;
      TILE = tag === 'webgpu' ? TILE_GPU : TILE_WASM;
      session = s;
      return s;
    } catch (err) { lastError = err; }
  }
  throw new Error(`Inference init failed: ${lastError?.message}`);
}

// Одна сессия на страницу: прогрев и запуск не создают двух.
export function getSession(onDownload = () => {}) {
  if (session) return Promise.resolve(session);
  if (!sessionPromise) sessionPromise = createSession(onDownload).catch((e) => { sessionPromise = null; throw e; });
  return sessionPromise;
}

const tileSteps = () => TILE_FRACTIONS.map((f) => Math.round(TILE * f / 64) * 64);
function tilePlan(size) {
  if (size <= TILE) return { tile: size, pos: [0] };
  const nMin = Math.ceil((size - OVERLAP) / (TILE - OVERLAP));
  const tile = tileSteps().find((t) => t * nMin - (nMin - 1) * OVERLAP >= size) ?? TILE;
  const stride = tile - OVERLAP;
  const pos = [];
  let p = 0;
  while (p + tile < size) { pos.push(p); p += stride; }
  pos.push(size - tile);
  return { tile, pos };
}

function toTensor(pixels, w, h) {
  const data = new Float32Array(3 * w * h);
  const ch = w * h;
  for (let i = 0; i < ch; i++) {
    data[i] = pixels[i * 4] / 255;
    data[ch + i] = pixels[i * 4 + 1] / 255;
    data[2 * ch + i] = pixels[i * 4 + 2] / 255;
  }
  return new ort.Tensor('float32', data, [1, 3, h, w]);
}

function toImageData(t, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  const ch = w * h;
  const d = t.data;
  for (let i = 0; i < ch; i++) {
    out[i * 4] = d[i] * 255;
    out[i * 4 + 1] = d[ch + i] * 255;
    out[i * 4 + 2] = d[2 * ch + i] * 255;
    out[i * 4 + 3] = 255;
  }
  return new ImageData(out, w, h);
}

// mode: enhance | upscale2x | upscale4x | unblur; quality 1-3 (сила). Возвращает PNG Blob.
export async function enhance(bitmap, mode, quality, { onDownload, onProgress, isCancelled } = {}) {
  const { width: W, height: H } = bitmap;
  if (W * H > MAX_INPUT_PIXELS) throw new Error('too_large');
  const srcCanvas = new OffscreenCanvas(W, H);
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  srcCtx.drawImage(bitmap, 0, 0);

  const s = await getSession(onDownload);
  const inputName = s.inputNames[0];
  const outputName = s.outputNames[0];
  const outScale = mode === 'upscale4x' ? 4 : mode === 'upscale2x' ? 2 : 1;
  const outCanvas = new OffscreenCanvas(W * outScale, H * outScale);
  const outCtx = outCanvas.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  const planX = tilePlan(W);
  const planY = tilePlan(H);
  const tw = planX.tile;
  const th = planY.tile;
  const total = planX.pos.length * planY.pos.length;
  const half = (OVERLAP / 2) * MODEL_SCALE;
  const tileCanvas = new OffscreenCanvas(tw * MODEL_SCALE, th * MODEL_SCALE);
  const tileCtx = tileCanvas.getContext('2d');
  tileCtx.imageSmoothingEnabled = true;
  tileCtx.imageSmoothingQuality = 'high';
  const strength = STRENGTH[quality] ?? 1;
  const mixCanvas = strength < 1 ? new OffscreenCanvas(tw * MODEL_SCALE, th * MODEL_SCALE) : null;
  const mixCtx = mixCanvas && mixCanvas.getContext('2d');
  const k = outScale / MODEL_SCALE;
  let done = 0;
  onProgress?.(0, total);

  for (const y of planY.pos) {
    for (const x of planX.pos) {
      if (isCancelled?.()) throw new Error('cancelled');
      const tileData = srcCtx.getImageData(x, y, tw, th);
      const result = await s.run({ [inputName]: toTensor(tileData.data, tw, th) });
      const outTile = toImageData(result[outputName], tw * MODEL_SCALE, th * MODEL_SCALE);
      const cropL = x > 0 ? half : 0;
      const cropT = y > 0 ? half : 0;
      const cropR = x + tw < W ? half : 0;
      const cropB = y + th < H ? half : 0;
      const sw = tw * MODEL_SCALE - cropL - cropR;
      const sh = th * MODEL_SCALE - cropT - cropB;
      if (mixCtx) {
        mixCtx.putImageData(outTile, 0, 0);
        tileCtx.globalAlpha = 1;
        tileCtx.drawImage(srcCanvas, x, y, tw, th, 0, 0, tw * MODEL_SCALE, th * MODEL_SCALE);
        tileCtx.globalAlpha = strength;
        tileCtx.drawImage(mixCanvas, 0, 0);
        tileCtx.globalAlpha = 1;
      } else {
        tileCtx.putImageData(outTile, 0, 0);
      }
      outCtx.drawImage(tileCanvas, cropL, cropT, sw, sh,
        x * outScale + cropL * k, y * outScale + cropT * k, sw * k, sh * k);
      done++;
      onProgress?.(done, total);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  return outCanvas.convertToBlob({ type: 'image/png' });
}
