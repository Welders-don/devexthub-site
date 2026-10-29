/*!
 * HEVC decoder core from @hevcjs/core v1.4.5 (MIT), https://github.com/lid-labs/hevc.js
 * Vendored: only the HEVCDecoder class + copyPlane helper; the package's demuxer/MSE parts
 * (which pull in mp4box) are not used here. Full licence in hevcjs-LICENSE.txt.
 */
// src/decoder.ts
var HEVCDecoder = class _HEVCDecoder {
  constructor(module) {
    this._m = module;
    this._api = {
      create: module.cwrap("hevc_decoder_create", "number", []),
      destroy: module.cwrap("hevc_decoder_destroy", null, ["number"]),
      decode: module.cwrap("hevc_decoder_decode", "number", ["number", "number", "number"]),
      getFrameCount: module.cwrap("hevc_decoder_get_frame_count", "number", ["number"]),
      getFrame: module.cwrap("hevc_decoder_get_frame", "number", ["number", "number", "number"]),
      getInfo: module.cwrap("hevc_decoder_get_info", "number", ["number", "number"]),
      feed: module.cwrap("hevc_decoder_feed", "number", ["number", "number", "number"]),
      drain: module.cwrap("hevc_decoder_drain", "number", ["number", "number"]),
      getDrainedFrame: module.cwrap("hevc_decoder_get_drained_frame", "number", ["number", "number", "number"]),
      flush: module.cwrap("hevc_decoder_flush", "number", ["number"])
    };
    this._dec = this._api.create();
    if (!this._dec) throw new Error("Failed to create HEVC decoder");
  }
  /**
   * Create a new decoder instance. Loads the WASM module.
   */
  static async create(options) {
    const factoryOpts = {};
    if (options?.wasmBinaryUrl) {
      factoryOpts.locateFile = () => options.wasmBinaryUrl;
    }
    const g = globalThis;
    if (typeof g.HEVCDecoderModule === "function") {
      const module2 = await g.HEVCDecoderModule(factoryOpts);
      return new _HEVCDecoder(module2);
    }
    const wasmUrl = options?.wasmUrl ?? "./wasm/hevc-decode.js";
    const mod = await import(
      /* @vite-ignore */
      wasmUrl
    );
    const fn = mod.default ?? mod;
    const module = await fn(factoryOpts);
    return new _HEVCDecoder(module);
  }
  /**
   * Decode a complete HEVC bitstream.
   * @param data Raw .265 bitstream bytes
   */
  decode(data) {
    const m = this._m;
    const ptr = m._malloc(data.length);
    try {
      m.HEAPU8.set(data, ptr);
      const ret = this._api.decode(this._dec, ptr, data.length);
      if (ret !== 0) throw new Error(`Decode failed (code ${ret})`);
      const count = this._api.getFrameCount(this._dec);
      const frames = [];
      for (let i = 0; i < count; i++) {
        const frame = this._extractFrame(i);
        if (frame) frames.push(frame);
      }
      const info = this._extractInfo();
      return { frames, info };
    } finally {
      m._free(ptr);
    }
  }
  /** Number of decoded frames available */
  get frameCount() {
    return this._api.getFrameCount(this._dec);
  }
  /** Get stream info (available after decode) */
  get info() {
    return this._extractInfo();
  }
  _extractFrame(index) {
    const m = this._m;
    const framePtr = m._malloc(48);
    try {
      const ret = this._api.getFrame(this._dec, index, framePtr);
      if (ret !== 0) return null;
      return this._readFrameFromPtr(framePtr);
    } finally {
      m._free(framePtr);
    }
  }
  _extractDrainedFrame(index) {
    const m = this._m;
    const framePtr = m._malloc(48);
    try {
      const ret = this._api.getDrainedFrame(this._dec, index, framePtr);
      if (ret !== 0) return null;
      return this._readFrameFromPtr(framePtr);
    } finally {
      m._free(framePtr);
    }
  }
  _readFrameFromPtr(framePtr) {
    const m = this._m;
    const yPtr = m.getValue(framePtr, "*");
    const cbPtr = m.getValue(framePtr + 4, "*");
    const crPtr = m.getValue(framePtr + 8, "*");
    const width = m.getValue(framePtr + 12, "i32");
    const height = m.getValue(framePtr + 16, "i32");
    const strideY = m.getValue(framePtr + 20, "i32");
    const strideC = m.getValue(framePtr + 24, "i32");
    const cw = m.getValue(framePtr + 28, "i32");
    const ch = m.getValue(framePtr + 32, "i32");
    const bd = m.getValue(framePtr + 36, "i32");
    const poc = m.getValue(framePtr + 40, "i32");
    const y = copyPlane(m, yPtr, width, height, strideY);
    const cb = copyPlane(m, cbPtr, cw, ch, strideC);
    const cr = copyPlane(m, crPtr, cw, ch, strideC);
    return { y, cb, cr, width, height, chromaWidth: cw, chromaHeight: ch, bitDepth: bd, poc };
  }
  _extractInfo() {
    const m = this._m;
    const infoPtr = m._malloc(24);
    try {
      const ret = this._api.getInfo(this._dec, infoPtr);
      if (ret !== 0) return null;
      return {
        width: m.getValue(infoPtr, "i32"),
        height: m.getValue(infoPtr + 4, "i32"),
        bitDepth: m.getValue(infoPtr + 8, "i32"),
        chromaFormat: m.getValue(infoPtr + 12, "i32"),
        profile: m.getValue(infoPtr + 16, "i32"),
        level: m.getValue(infoPtr + 20, "i32")
      };
    } finally {
      m._free(infoPtr);
    }
  }
  // --- Incremental API (streaming) ---
  /**
   * Feed a chunk of data containing one or more complete NAL units.
   * The decoder accumulates parameter sets and decodes pictures incrementally.
   * Call drain() after each feed() to retrieve output-ready frames.
   */
  feed(data) {
    const m = this._m;
    const ptr = m._malloc(data.length);
    try {
      m.HEAPU8.set(data, ptr);
      const ret = this._api.feed(this._dec, ptr, data.length);
      if (ret !== 0) throw new Error(`Feed failed (code ${ret})`);
    } finally {
      m._free(ptr);
    }
  }
  /**
   * Drain output-ready frames from the decoder (§C.5.2 bumping process).
   * Returns frames in display order, only when ready per DPB constraints.
   *
   * Planes are copied out of the WASM heap, so the returned frames stay
   * valid across later feed() and destroy() calls. Draining after every
   * feed() is what keeps the DPB at its bound — the decoder cannot reclaim
   * a picture before it has been bumped out. See docs/memory-envelope.md.
   */
  drain() {
    const m = this._m;
    const countPtr = m._malloc(4);
    try {
      const ret = this._api.drain(this._dec, countPtr);
      if (ret !== 0) return [];
      const count = m.getValue(countPtr, "i32");
      const frames = [];
      for (let i = 0; i < count; i++) {
        const frame = this._extractDrainedFrame(i);
        if (frame) frames.push(frame);
      }
      return frames;
    } finally {
      m._free(countPtr);
    }
  }
  /**
   * Flush all remaining frames from the DPB (call at end of stream).
   * Returns all buffered frames in display order.
   */
  flush() {
    const ret = this._api.flush(this._dec);
    if (ret !== 0) return [];
    const m = this._m;
    const countPtr = m._malloc(4);
    try {
      const frames = [];
      const framePtr = m._malloc(48);
      try {
        for (let i = 0; ; i++) {
          const r = this._api.getDrainedFrame(this._dec, i, framePtr);
          if (r !== 0) break;
          frames.push(this._readFrameFromPtr(framePtr));
        }
      } finally {
        m._free(framePtr);
      }
      return frames;
    } finally {
      m._free(countPtr);
    }
  }
  /** Release decoder resources */
  destroy() {
    if (this._dec) {
      this._api.destroy(this._dec);
      this._dec = 0;
    }
  }
};
function copyPlane(m, ptr, width, height, stride) {
  const out = new Uint16Array(width * height);
  const base = ptr >> 1;
  for (let y = 0; y < height; y++) {
    out.set(m.HEAPU16.subarray(base + y * stride, base + y * stride + width), y * width);
  }
  return out;
}

export { HEVCDecoder };
