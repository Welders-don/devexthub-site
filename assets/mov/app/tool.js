// Конвертер MOV ↔ MP4 прямо на странице /convert-mov-to-mp4/. Один файл за раз: пачка (целая
// папка) остаётся за расширением (решение Дениса 29.10). Движок = копия расширения (convert.js),
// логика проверок перенесена из его main.js упрощённо. Файл не покидает браузер.
import { analyze, convert, plannedOutput } from './convert.js';

const $ = (id) => document.getElementById(id);
const drop = $('mvt-drop');
const input = $('mvt-file');
const states = ['mvt-idle', 'mvt-busy', 'mvt-big', 'mvt-done', 'mvt-error'];
// Выше этого выход в памяти рискует уронить вкладку (опыт расширения 22.09): пишем сразу на диск.
const BIG_FILE_BYTES = 150 * 1024 * 1024;
const VIDEO_EXT = /\.(mov|qt|mp4|m4v)$/i;
let busy = false;
let ticker = 0;
let pending = null;
let lastUrl = null;

function show(id) {
  states.forEach((s) => { $(s).hidden = s !== id; });
}

function track(name, data) {
  if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
}

function humanSize(bytes) {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < u.length - 1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(i ? 1 : 0)} ${u[i]}`;
}

const isOom = (err) => err instanceof RangeError || /allocation failed|out of memory|exceeded maximum size/i.test(err?.message || '');

function startClock() {
  const t0 = Date.now();
  const bar = $('mvt-bar');
  bar.removeAttribute('value');
  const render = () => {
    const sec = Math.round((Date.now() - t0) / 1000);
    const pct = bar.hasAttribute('value') ? `${Math.round(bar.value * 100)}% · ` : '';
    $('mvt-clock').textContent = `${pct}${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };
  render();
  ticker = setInterval(render, 1000);
  return t0;
}

function stopClock() {
  clearInterval(ticker);
  ticker = 0;
}

function fail(msg, data) {
  stopClock();
  $('mvt-error-text').textContent = msg;
  show('mvt-error');
  track('mov-run', { result: 'error', ...data });
}

// Предупреждения как в расширении: звук не доехал / готовый файл короче исходника.
function warnings(info, res) {
  const out = [];
  const audioDropped = (res.discardedTracks || []).some((d) => d.track.type === 'audio') || (info.hasAudio && res.hasAudio === false);
  if (audioDropped) out.push("Saved without sound: the browser can't read this file's audio format.");
  else if (info.pcm && !info.audioToAac) out.push('The sound is kept uncompressed (PCM), some players may not play it.');
  if (res.outDurationSec >= 0 && info.durationSec > 0
    && info.durationSec - res.outDurationSec > Math.max(1, info.durationSec * 0.02)) {
    out.push(`The saved video is shorter than the original (${Math.round(res.outDurationSec)} s of ${Math.round(info.durationSec)} s). Part of it may be missing.`);
  }
  return out;
}

async function run(file, handle) {
  $('mvt-name').textContent = `${file.name} · ${humanSize(file.size)}`;
  $('mvt-state').textContent = 'Reading the file…';
  show('mvt-busy');
  const t0 = startClock();
  const sizeMb = Math.round(file.size / 1048576);
  let info;
  try {
    info = await analyze(file);
  } catch (err) {
    return fail(VIDEO_EXT.test(file.name || '')
      ? "This file can't be read. It looks damaged or not fully downloaded."
      : "This isn't a video we can read here. Try a MOV or MP4 file.", { path: 'rejected', sizeMb });
  }
  if (!info.videoCodec && !info.audioCodec && info.unknownCodecs) {
    return fail("This video is in an older format (from an old camera or phone) that browsers can't read, so it can't be converted here.", { path: 'oldcodec', sizeMb });
  }
  const sw = info.transcode && info.softwareDecode;
  const path = !info.videoCodec ? 'audio' : info.isH264 ? 'remux' : sw ? 'transcode_sw' : info.transcode ? 'transcode' : 'fallback';
  $('mvt-state').textContent = `${(info.videoCodec || 'audio').toUpperCase()} → ${info.kind.toUpperCase()} · ` + {
    audio: 'audio only, copying the track as is',
    remux: 'instant, no quality loss',
    transcode_sw: 'no video decoder on this computer, converting in software, may take a few minutes',
    transcode: 'converting to H.264 on your computer',
    fallback: "your browser can't re-encode this codec, keeping the original (may not play on Windows)",
  }[path];
  track('mov-pick', { path, kind: info.kind, sizeMb });

  let writable = null;
  let res;
  try {
    if (handle) writable = await handle.createWritable();
    res = await convert(file, {
      kind: info.kind, transcode: info.transcode, hdr: info.hdr, audioToAac: info.audioToAac,
      writable, readBack: handle ? () => handle.getFile() : undefined,
      onProgress: (p) => { $('mvt-bar').value = p; },
    });
  } catch (err) {
    try { await writable?.abort?.(); } catch { /* поток мог не открыться */ }
    try { await handle?.remove?.(); } catch { /* пустой файл останется в старом Chrome */ }
    const msg = isOom(err) ? 'Not enough browser memory for a file this size. Try Chrome on a computer, it can write big files straight to disk.'
      : /reclaimed/i.test(err?.message || '') ? 'Chrome paused the conversion while this tab was in the background. Keep this tab open and try again.'
      : err.message;
    return fail(msg, { path, sizeMb, err: String(err?.message || err).slice(0, 40) });
  }
  if (info.videoCodec && res.hasVideo === false) {
    return fail("This video's format isn't supported by your browser, nothing was converted.", { path, sizeMb, err: 'video-dropped' });
  }
  stopClock();
  const secs = Math.round((Date.now() - t0) / 1000);
  const notes = warnings(info, res);
  $('mvt-warn').textContent = notes.join(' ');
  $('mvt-warn').hidden = !notes.length;
  const dl = $('mvt-dl');
  if (res.blob) {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(res.blob);
    dl.href = lastUrl;
    dl.download = res.outName;
    dl.textContent = `Download again · ${humanSize(res.blob.size)}`;
    dl.hidden = false;
    dl.click(); // сразу в «Загрузки», кнопка на случай блокировки авто-скачивания
    $('mvt-done-title').textContent = `${res.outName} is in your Downloads`;
  } else {
    dl.hidden = true;
    $('mvt-done-title').textContent = `Saved ${res.outName}`;
  }
  show('mvt-done');
  track('mov-run', { result: notes.length ? 'warn' : 'ok', path, kind: info.kind, sizeMb, secs });
}

// Диалог сохранения требует свежего жеста; после выбора файла он часто уже истёк,
// тогда просим клик по кнопке (как в расширении).
async function pickTarget(file) {
  const { kind, outName } = plannedOutput(file);
  const mime = kind === 'mov' ? 'video/quicktime' : 'video/mp4';
  return window.showSaveFilePicker({
    suggestedName: outName,
    types: [{ description: `${kind.toUpperCase()} video`, accept: { [mime]: [`.${kind}`] } }],
  });
}

async function start(files) {
  const list = [...(files || [])].filter(Boolean);
  if (!list.length || busy) return;
  busy = true;
  const file = list[0];
  $('mvt-multi').hidden = list.length < 2;
  if (list.length > 1) track('mov-multi', { n: list.length });
  try {
    if (file.size > BIG_FILE_BYTES && window.showSaveFilePicker) {
      const gesture = !navigator.userActivation || navigator.userActivation.isActive;
      if (!gesture) {
        pending = file;
        $('mvt-big-name').textContent = `${file.name} · ${humanSize(file.size)}`;
        show('mvt-big');
        return;
      }
      let handle;
      try {
        handle = await pickTarget(file);
      } catch (err) {
        if (err.name === 'AbortError') { show('mvt-idle'); return; }
      }
      await run(file, handle);
      return;
    }
    await run(file, null);
  } finally {
    busy = false;
  }
}

$('mvt-big-go').addEventListener('click', async () => {
  const file = pending;
  if (!file || busy) return;
  busy = true;
  try {
    let handle;
    try {
      handle = await pickTarget(file);
    } catch (err) {
      if (err.name === 'AbortError') { show('mvt-idle'); return; }
    }
    await run(file, handle);
  } finally {
    busy = false;
  }
});

input.addEventListener('change', () => { start(input.files); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => start(e.dataTransfer.files));
document.querySelectorAll('.mvt-again').forEach((b) => b.addEventListener('click', () => { show('mvt-idle'); input.click(); }));
// Авто-клик после конвертации не считаем, только ручной повтор.
$('mvt-dl').addEventListener('click', (e) => { if (e.isTrusted) track('mov-download-again'); });
