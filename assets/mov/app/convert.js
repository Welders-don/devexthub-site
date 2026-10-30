// Копия движка расширения Convert MOV to MP4 1.0.6 (Convertmovtomp4, ветка agent/unknown-codec, 29.10),
// правки: без chrome.i18n; 30.10 для страницы MKV — listAudioTracks() и выбор одной звуковой дорожки (audioPick).
// Правка движка в расширении сама сюда НЕ приедет.
// Conversion engine — thin wrapper over Mediabunny (bundled locally, MPL-2.0).
// Mediabunny copies compatible streams (instant remux) and only transcodes when
// the codec can't live in the target container, so path routing is automatic.
import {
  Input, Output, Conversion, ALL_FORMATS, BlobSource,
  Mp4OutputFormat, MovOutputFormat, BufferTarget, StreamTarget, canEncodeAudio,
} from "../vendor/mediabunny.min.mjs";

// Containers MP4 and MOV both accept these video codecs, so a swap between them
// is a lossless copy (remux). Anything else forces a transcode.
const REMUXABLE_VIDEO = new Set(["avc", "hevc", "av1", "vp9"]);

function targetFor(file) {
  const name = (file.name || "").toLowerCase();
  const isMov = name.endsWith(".mov") || name.endsWith(".qt") || file.type === "video/quicktime";
  // .mov in → .mp4 out; anything else (incl. .mp4) → .mov only when explicitly a
  // reverse job. Default output is MP4 (the anchor use case).
  return isMov ? "mp4" : (name.endsWith(".mp4") ? "mov" : "mp4");
}

// Small files buffer in memory to place metadata up front (fastStart "in-memory" =
// compact, best playback). Streaming to disk can't hold everything in RAM, so metadata
// goes at the end (fastStart false) — fine for a file that's downloaded then played.
function outFormat(kind, { streaming } = {}) {
  const fastStart = streaming ? false : "in-memory";
  return kind === "mov" ? new MovOutputFormat({ fastStart }) : new Mp4OutputFormat({ fastStart });
}

// HDR → SDR. iPhone с 12-й модели пишет HEVC 10 бит HLG (BT.2020), а наш H.264 8-битный и
// помечается как обычное видео: без перевода плеер читает цвета BT.2020 как BT.709 и
// картинка уезжает (21.10: PSNR 26 дБ против 42 у ffmpeg). Canvas в Chrome цветоуправляемый:
// drawImage кадра с HLG/PQ сам делает тонмаппинг в sRGB, его и отдаём энкодеру.
// Рисуем VideoFrame, а не sample.draw(): draw() поворачивает кадр, а поворот у портретного
// видео остаётся ещё и в метаданных дорожки — вышло бы два поворота.
function toneMapToSdr() {
  let ctx = null;
  return (sample) => {
    const frame = sample.toVideoFrame();
    if (!ctx) ctx = new OffscreenCanvas(frame.displayWidth, frame.displayHeight).getContext("2d");
    ctx.drawImage(frame, 0, 0);
    frame.close();
    return ctx.canvas;
  };
}

function newName(file, kind) {
  const base = (file.name || "video").replace(/\.[^.]+$/, "");
  return `${base}.${kind}`;
}

// Cheap, synchronous plan (filename only) — lets the UI open the save dialog while the
// user gesture is still fresh, before the async analyze() reads the file.
export function plannedOutput(file) {
  const kind = targetFor(file);
  return { kind, outName: newName(file, kind) };
}

// Ask the browser itself whether it can encode H.264 at this size. Chromium builds without
// proprietary codecs (and headless shells) decode fine but refuse to encode.
// 18.10: спрашивали только avc1.42001f (Baseline 3.1, потолок 1280x720). Chrome Дениса
// (Windows) на 1080p: 42001f=false, 4d0028/640028/640033=true. Поэтому КАЖДЫЙ HEVC с iPhone уходил копией (путь fallback,
// 67 из 67 не-H.264 конвертаций на 1.0.1-1.0.2) и снова просил кодек. Пробуем уровни
// по возрастанию, хватит любого.
const H264_PROBES = ["avc1.42001f", "avc1.4d0028", "avc1.640028", "avc1.640033", "avc1.640034"];
export async function browserEncodesH264(videoTrack) {
  if (typeof VideoEncoder === "undefined") return false;
  for (const codec of H264_PROBES) {
    try {
      const support = await VideoEncoder.isConfigSupported({
        codec,
        width: videoTrack.codedWidth,
        height: videoTrack.codedHeight,
      });
      if (support.supported === true) return true;
    } catch { /* следующий уровень */ }
  }
  return false;
}

// Read back the file we're about to hand over and confirm the video track is in it.
// The conversion can finish "successfully" with an empty 152-byte container and an empty
// `discardedTracks` (seen 17.09 on a Chromium build that decodes but can't encode H.264),
// so the engine's own report is not proof — the output is.
// Читаем и с диска: до 29.10 файлы >150 МБ и пачка в папку уходили без проверки вовсе,
// а это как раз длинные записи. Пустой контейнер читается (видео null), поэтому сбой самого
// чтения = «неизвестно» ({}), а не «пусто»: из-за проверки готовый файл не роняем.
async function inspectOutput(getFile) {
  try {
    const out = new Input({ source: new BlobSource(await getFile()), formats: ALL_FORMATS });
    return {
      hasVideo: !!(await out.getPrimaryVideoTrack()),
      hasAudio: !!(await out.getPrimaryAudioTrack()),
      outDurationSec: await out.computeDuration(),
    };
  } catch {
    return {};
  }
}

// Inspect the file cheaply (metadata only) and decide how to convert it.
// The output is H.264 whenever we can produce it:
//   - source already H.264  → copy (instant, no quality loss)
//   - source other codec, decodable here (e.g. HEVC with a hardware decoder) → transcode
//   - source other codec, NOT decodable here → we can't re-encode it in this browser, so
//     copy it as-is (video survives; may not play everywhere) rather than drop the track.
export async function analyze(file) {
  const kind = targetFor(file);
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const videoTrack = await input.getPrimaryVideoTrack();
  const audioTrack = await input.getPrimaryAudioTrack();
  const durationSec = await input.computeDuration();
  const videoCodec = videoTrack ? await videoTrack.getCodec() : null;
  const isH264 = videoCodec === "avc";
  // Only probe the decoder when we'd actually need to re-encode.
  let decodable = videoCodec && !isH264 ? await videoTrack.canDecode() : true;
  // No hardware HEVC decoder (the norm on Windows/Linux, where Chromium ships no software
  // one): register our own, otherwise this file could only be copied as-is and still
  // wouldn't play. Loaded only here, so machines with a decoder never fetch the wasm.
  let softwareDecode = false;
  if (videoCodec === "hevc") {
    const { enableHevcFallback, hevcFallbackEnabled } = await import("./hevc-fallback.js");
    if (!decodable) {
      enableHevcFallback();
      decodable = await videoTrack.canDecode();
    }
    // После первой регистрации canDecode() уже true и для следующих файлов, но декодирует
    // всё равно wasm: без этой проверки второй файл шёл как «transcode» без предупреждения
    // о минутах (21.10, PH 57d032: transcode_sw, потом transcode на том же файле).
    softwareDecode = decodable && hevcFallbackEnabled();
  }
  // Декодировать мало — надо ещё чем-то закодировать. Сборки Chromium без проприетарных
  // кодеков декодируют, но H.264 не кодируют, и тогда на выходе получается пустой
  // контейнер в 152 байта, причём БЕЗ единой записи в discardedTracks (поймано e2e-прогоном
  // 17.09). Нет энкодера — честнее скопировать исходное видео как есть.
  // Спрашиваем сам браузер: `canEncodeVideo` Mediabunny в этой же ситуации отвечает true.
  const canEncodeH264 = !isH264 && decodable ? await browserEncodesH264(videoTrack) : true;
  const transcode = !!videoCodec && !isH264 && decodable && canEncodeH264;
  const hdr = transcode && await videoTrack.hasHighDynamicRange();
  const audioCodec = audioTrack ? await audioTrack.getCodec() : null;
  // Дорожка есть, но кодек движку незнаком (MJPEG старых камер, H.263/MPEG-4 и AMR старых
  // телефонов): getCodec() = null, сырой код из контейнера отдаёт только getInternalCodecId().
  const rawId = async (track, codec) => track && !codec ? String(await track.getInternalCodecId() ?? "?") : null;
  const audioId = await rawId(audioTrack, audioCodec);
  const unknownCodecs = [await rawId(videoTrack, videoCodec), audioId]
    .filter(Boolean).join("/");
  // Несжатый звук камер (Canon/Nikon/Sony пишут H.264 + LPCM) в MP4 ложится как ipcm/fpcm,
  // а это редкая запись, не всякий плеер её играет. Перекодируем в AAC, если браузер умеет
  // (Chrome на Windows/Mac умеет, на Linux нет); не умеет — звук остаётся как был: выкинуть
  // его хуже. Без проверки Mediabunny молча выбрасывает дорожку (no_encodable_target_codec).
  // В MOV PCM родной, там не трогаем.
  const pcm = kind === "mp4" && /^(pcm-|ulaw|alaw)/.test(audioCodec || "");
  const audioToAac = pcm && await canEncodeAudio("aac", {
    numberOfChannels: audioTrack.numberOfChannels, sampleRate: audioTrack.sampleRate, bitrate: 192000,
  });
  return {
    kind,
    outName: newName(file, kind),
    durationSec,
    videoCodec,
    audioCodec,
    audioLabel: audioCodec || audioId || "noaudio", // для телеметрии: «pcm-s16», «alac», «noaudio»
    pcm,                // несжатый звук, идёт в MP4
    audioToAac,         // true → PCM перекодируем в AAC
    unknownCodecs,      // "jpeg/ima4" — raw codec ids of tracks the engine can't read, "" if none
    hasAudio: !!audioTrack, // звук был: на выходе его отсутствие = потеря, даже если движок промолчал
    sizeBytes: file.size,
    transcode,          // re-encode video to H.264
    decodable,          // false → non-H.264 codec this browser can't decode (copy-only)
    isH264,             // already H.264 → instant copy
    softwareDecode,     // true → HEVC decoded in wasm (no GPU decoder), minutes not seconds
    canEncodeH264,      // false → browser can't encode H.264 at all; we copy instead
    hdr,                // true → HDR source, tone-mapped to SDR while transcoding
  };
}

// Run the conversion. Pass `writable` (a FileSystemWritableFileStream from the File
// System Access API) to stream straight to disk for big files — StreamTarget takes the
// writer and closes it on finalize, committing the file. Without it, buffer in memory
// and return a { blob } for a download link.
// Pass `transcode` (from analyze()) to re-encode the video to H.264 so it plays on any
// device. Without it the video track is copied as-is (instant remux) — used for H.264
// sources and for codecs this browser can't decode (dropping the track would be worse).
// `writable` streams straight to disk for big files; otherwise buffer → { blob }.
// `readBack` (with `writable`) returns the saved File once the stream is closed.
// Returns { blob?, outName, discardedTracks, hasVideo?, hasAudio?, outDurationSec? }.
export async function convert(file, { kind, onProgress, writable, readBack, transcode, hdr, audioToAac, audioPick } = {}) {
  const outKind = kind || targetFor(file);
  const streaming = !!writable;
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const target = streaming
    ? new StreamTarget(writable, { chunked: true })
    : new BufferTarget();
  const output = new Output({ format: outFormat(outKind, { streaming }), target });

  const options = { input, output };
  if (transcode) options.video = { codec: "avc", ...(hdr && { process: toneMapToSdr() }) }; // re-encode to H.264
  if (audioToAac) options.audio = { codec: "aac", bitrate: 192000 };
  // Страница MKV: оставить одну выбранную дорожку (track.number, 1-based), остальные выкинуть.
  if (audioPick) {
    options.audio = (track) => track.number !== audioPick ? { discard: true }
      : audioToAac ? { codec: "aac", bitrate: 192000 } : {};
  }
  const conversion = await Conversion.init(options);
  if (!conversion.isValid) {
    throw new Error("This file can't be converted — no usable video or audio track.");
  }
  if (onProgress) conversion.onProgress = onProgress;
  await conversion.execute();

  const outName = newName(file, outKind);
  if (streaming) {
    // StreamTarget закрыл поток в finalize: файл на диске уже окончательный.
    return { outName, discardedTracks: conversion.discardedTracks, ...await inspectOutput(readBack) };
  }
  const mime = outKind === "mov" ? "video/quicktime" : "video/mp4";
  const blob = new Blob([output.target.buffer], { type: mime });
  return { blob, outName, discardedTracks: conversion.discardedTracks, ...await inspectOutput(() => blob) };
}

// Звуковые дорожки файла для выбора на странице MKV (30.10): номер, язык, имя, кодек, каналы,
// можно ли перекодировать в AAC в этом браузере (AC-3/DTS Chrome обычно не декодирует).
export async function listAudioTracks(file) {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const tracks = await input.getAudioTracks();
  const out = [];
  for (const t of tracks) {
    const codec = await t.getCodec();
    const decodable = codec ? await t.canDecode() : false;
    const aac = decodable && await canEncodeAudio("aac", { numberOfChannels: Math.min(t.numberOfChannels, 2), sampleRate: t.sampleRate, bitrate: 192000 });
    out.push({ number: t.number, lang: await t.getLanguageCode(), name: await t.getName(), codec: codec || String(await t.getInternalCodecId() ?? "?"), channels: t.numberOfChannels, aac });
  }
  return out;
}
