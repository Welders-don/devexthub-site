// Software HEVC decoder, used ONLY when the browser has no hardware one.
//
// Chromium ships no software HEVC fallback on Windows/Linux: without a GPU decoder
// `canDecode()` is false, we can't re-encode to H.264, and the user ends up with an MP4
// that still won't play. This wraps @hevcjs/core (MIT, 262 KB wasm) as a Mediabunny
// custom decoder, so that path produces real H.264 instead.
//
// It is registered lazily — see enableHevcFallback(). While unregistered, Mediabunny's
// `canDecode()` reports the browser's native support, which is what we want: users with
// a hardware decoder keep the fast native path and never load the wasm.
import { CustomVideoDecoder, registerDecoder, VideoSample } from "../vendor/mediabunny.min.mjs";
import { HEVCDecoder } from "../vendor/hevc-decoder.mjs";

const GLUE_URL = "../vendor/hevc-decode.js";
const START_CODE = new Uint8Array([0, 0, 0, 1]);

let gluePromise = null;
let registered = false;

// The emscripten glue is a UMD bundle, not an ES module: load it as a classic script so
// it publishes globalThis.HEVCDecoderModule, which HEVCDecoder.create() then picks up.
function loadGlue() {
  gluePromise = gluePromise || new Promise((resolve, reject) => {
    if (globalThis.HEVCDecoderModule) return resolve();
    const el = document.createElement("script");
    el.src = new URL(GLUE_URL, import.meta.url).href;
    el.onload = () => (globalThis.HEVCDecoderModule ? resolve() : reject(new Error("glue loaded but no factory")));
    el.onerror = () => reject(new Error("failed to load HEVC decoder"));
    document.head.append(el);
  });
  return gluePromise;
}

// hvcC (the `description` of an hvc1 track) holds the parameter sets the decoder needs
// before any frame, and the byte length of the size prefix on every NAL unit.
function parseHvcC(description) {
  // description приходит вью на буфер файла — брать у него .buffer нельзя, это весь файл.
  const d = ArrayBuffer.isView(description)
    ? new Uint8Array(description.buffer, description.byteOffset, description.byteLength)
    : new Uint8Array(description);
  const nalLengthSize = (d[21] & 0b11) + 1;
  const parameterSets = [];
  let p = 23;
  for (let a = 0, arrays = d[22]; a < arrays && p + 2 < d.length; a++) {
    p += 1; // array_completeness + NAL unit type
    const count = (d[p] << 8) | d[p + 1];
    p += 2;
    for (let n = 0; n < count && p + 1 < d.length; n++) {
      const len = (d[p] << 8) | d[p + 1];
      p += 2;
      parameterSets.push(d.subarray(p, p + len));
      p += len;
    }
  }
  return { nalLengthSize, parameterSets };
}

function toAnnexB(chunks) {
  let size = 0;
  for (const c of chunks) size += START_CODE.length + c.length;
  const out = new Uint8Array(size);
  let p = 0;
  for (const c of chunks) {
    out.set(START_CODE, p);
    p += START_CODE.length;
    out.set(c, p);
    p += c.length;
  }
  return out;
}

// Length-prefixed sample (hvc1) → Annex B. Streams tagged hev1 are already Annex B.
function sampleToAnnexB(data, nalLengthSize) {
  if (!nalLengthSize) return data;
  const chunks = [];
  for (let p = 0; p + nalLengthSize <= data.length;) {
    let len = 0;
    for (let i = 0; i < nalLengthSize; i++) len = (len << 8) | data[p + i];
    p += nalLengthSize;
    if (len <= 0 || p + len > data.length) break;
    chunks.push(data.subarray(p, p + len));
    p += len;
  }
  return toAnnexB(chunks);
}

// The decoder hands back planes as Uint16Array regardless of depth; pack them into the
// layout VideoSample expects (Y, then Cb, then Cr, tightly packed).
function toVideoSample(frame, timestamp, duration, colorSpace) {
  const tenBit = frame.bitDepth > 8;
  const lumaSize = frame.width * frame.height;
  const chromaSize = frame.chromaWidth * frame.chromaHeight;
  const total = lumaSize + 2 * chromaSize;
  const buf = tenBit ? new Uint16Array(total) : new Uint8Array(total);
  buf.set(frame.y, 0);
  buf.set(frame.cb, lumaSize);
  buf.set(frame.cr, lumaSize + chromaSize);
  return new VideoSample(buf, {
    format: tenBit ? "I420P10" : "I420",
    codedWidth: frame.width,
    codedHeight: frame.height,
    timestamp,
    duration,
    // Без цветового пространства 10-битный HLG рисуется на canvas как обычное видео,
    // и тонмаппинг HDR → SDR (convert.js) не срабатывает.
    colorSpace,
  });
}

class HevcFallbackDecoder extends CustomVideoDecoder {
  static supports(codec) {
    return codec === "hevc";
  }

  async init() {
    await loadGlue();
    this.decoder = await HEVCDecoder.create();
    this.nalLengthSize = 0;
    // Frames come out in display order, so the presentation timestamps of the packets
    // fed in — sorted ascending — line up with them one by one.
    this.timestamps = [];
    if (this.config?.description) {
      const { nalLengthSize, parameterSets } = parseHvcC(this.config.description);
      this.nalLengthSize = nalLengthSize;
      if (parameterSets.length) this.decoder.feed(toAnnexB(parameterSets));
    }
  }

  decode(packet) {
    this.timestamps.push({ timestamp: packet.timestamp, duration: packet.duration });
    this.decoder.feed(sampleToAnnexB(packet.data, this.nalLengthSize));
    this.emit(this.decoder.drain());
  }

  flush() {
    this.emit(this.decoder.flush());
  }

  close() {
    this.decoder?.destroy();
    this.decoder = null;
  }

  emit(frames) {
    if (!frames.length) return;
    this.timestamps.sort((a, b) => a.timestamp - b.timestamp);
    for (const frame of frames) {
      const { timestamp, duration } = this.timestamps.shift() ?? { timestamp: 0, duration: 0 };
      this.onSample(toVideoSample(frame, timestamp, duration, this.config?.colorSpace));
    }
  }
}

/**
 * Register the software decoder. Call this only after the browser's own `canDecode()`
 * has come back false — once registered, Mediabunny prefers the custom decoder over the
 * native one for every HEVC track in this page.
 */
export const hevcFallbackEnabled = () => registered;

export function enableHevcFallback() {
  if (registered) return;
  registerDecoder(HevcFallbackDecoder);
  registered = true;
}
