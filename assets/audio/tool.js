// Видео → звук на странице /mov-to-mp3/ (30.10): MP3 (LAME через @mediabunny/mp3-encoder), WAV, M4A (AAC,
// только если браузер его кодирует). Один файл, всё в браузере. Движок = вендоренный Mediabunny из /assets/mov/.
import {
  Input, Output, Conversion, ALL_FORMATS, BlobSource, BufferTarget,
  Mp3OutputFormat, WavOutputFormat, Mp4OutputFormat, canEncodeAudio,
} from '../mov/vendor/mediabunny.min.mjs';
import { registerMp3Encoder } from '../mov/vendor/mediabunny-mp3-encoder.min.mjs';

registerMp3Encoder();

const $ = (id) => document.getElementById(id);
const drop = $('a2m-drop');
const input = $('a2m-file');
const states = ['a2m-idle', 'a2m-opts', 'a2m-busy', 'a2m-done', 'a2m-error'];
// WAV держим в памяти целиком: выше этого вкладка рискует упасть.
const MAX_OUT_BYTES = 1.5 * 1024 ** 3;
let file = null;
let info = null;
let conversion = null;
let lastUrl = null;

const show = (id) => states.forEach((s) => { $(s).hidden = s !== id; });
const track = (name, data) => { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); };

function humanSize(bytes) {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < u.length - 1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(i ? 1 : 0)} ${u[i]}`;
}
const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

function fail(msg, data) {
  $('a2m-error-text').textContent = msg;
  show('a2m-error');
  track('mp3-run', { result: 'error', ...data });
}

// Примерный размер на выходе: WAV = 16 бит на канал, сжатые = битрейт.
function estimate() {
  const fmt = $('a2m-format').value;
  const bytes = fmt === 'wav' ? info.duration * info.sampleRate * info.channels * 2
    : info.duration * Number($('a2m-kbps').value) * 125;
  $('a2m-kbps-wrap').hidden = fmt === 'wav';
  const tooBig = bytes > MAX_OUT_BYTES;
  $('a2m-est').textContent = tooBig ? `About ${humanSize(bytes)}: too big for a browser tab. Pick MP3 or M4A instead.`
    : `About ${humanSize(bytes)} · ${clock(info.duration)} of sound`;
  $('a2m-go').disabled = tooBig;
}

async function load(f) {
  if (!f) return;
  file = f;
  $('a2m-name').textContent = `${f.name} · ${humanSize(f.size)}`;
  try {
    const src = new Input({ source: new BlobSource(f), formats: ALL_FORMATS });
    const audio = await src.getPrimaryAudioTrack();
    if (!audio) return fail("This video has no sound track, so there's nothing to save as audio.", { path: 'noaudio' });
    const codec = await audio.getCodec();
    if (!codec || !(await audio.canDecode())) {
      return fail(`Your browser can't read the sound of this video (${String(codec || await audio.getInternalCodecId() || 'unknown').toUpperCase()}), so it can't be converted here.`, { path: 'nodecode', codec: String(codec) });
    }
    info = { codec, duration: await src.computeDuration(), sampleRate: audio.sampleRate, channels: audio.numberOfChannels };
  } catch {
    return fail("This file can't be read. Try an MP4, MOV, MKV or WEBM video.", { path: 'rejected' });
  }
  // M4A = AAC, его кодирует сам браузер (Chrome на Windows/Mac да, на Linux нет).
  const aac = await canEncodeAudio('aac', { numberOfChannels: Math.min(info.channels, 2), sampleRate: info.sampleRate, bitrate: 192000 }).catch(() => false);
  const m4a = $('a2m-format').querySelector('option[value="m4a"]');
  m4a.disabled = !aac;
  m4a.textContent = aac ? 'M4A (AAC)' : 'M4A (not supported in this browser)';
  if (!aac && $('a2m-format').value === 'm4a') $('a2m-format').value = 'mp3';
  estimate();
  show('a2m-opts');
  track('mp3-pick', { codec: info.codec, mins: Math.round(info.duration / 60), sizeMb: Math.round(f.size / 1048576) });
}

async function run() {
  const fmt = $('a2m-format').value;
  const kbps = Number($('a2m-kbps').value);
  const sizeMb = Math.round(file.size / 1048576);
  $('a2m-status').textContent = `Saving the sound as ${fmt.toUpperCase()}…`;
  $('a2m-bar').value = 0;
  show('a2m-busy');
  const t0 = Date.now();
  const format = fmt === 'mp3' ? new Mp3OutputFormat() : fmt === 'wav' ? new WavOutputFormat() : new Mp4OutputFormat({ fastStart: 'in-memory' });
  const output = new Output({ format, target: new BufferTarget() });
  const audio = fmt === 'mp3' ? { codec: 'mp3', bitrate: kbps * 1000 } : fmt === 'm4a' ? { codec: 'aac', bitrate: kbps * 1000 } : {};
  try {
    conversion = await Conversion.init({
      input: new Input({ source: new BlobSource(file), formats: ALL_FORMATS }),
      output,
      video: { discard: true },
      // MP3 и AAC не бывают больше двух каналов в наших настройках: 5.1 сводим в стерео.
      audio: { ...audio, ...(info.channels > 2 && { numberOfChannels: 2 }) },
    });
    if (!conversion.isValid) throw new Error("This video's sound can't be converted in your browser.");
    conversion.onProgress = (p) => { $('a2m-bar').value = p; };
    await conversion.execute();
  } catch (err) {
    conversion = null;
    if (err?.name === 'ConversionCanceledError' || /cancel/i.test(err?.message || '')) { show('a2m-opts'); return; }
    const oom = err instanceof RangeError || /allocation failed|out of memory/i.test(err?.message || '');
    return fail(oom ? 'Not enough browser memory for a file this size. Pick MP3 instead of WAV, or try Chrome on a computer.' : err.message,
      { path: fmt, sizeMb, err: String(err?.message || err).slice(0, 40) });
  }
  conversion = null;
  const mime = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4' }[fmt];
  const blob = new Blob([output.target.buffer], { type: mime });
  const name = `${(file.name || 'audio').replace(/\.[^.]+$/, '')}.${fmt}`;
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(blob);
  const dl = $('a2m-dl');
  dl.href = lastUrl;
  dl.download = name;
  dl.textContent = `Download again · ${humanSize(blob.size)}`;
  dl.click(); // сразу в «Загрузки», кнопка на случай блокировки авто-скачивания
  $('a2m-player').src = lastUrl;
  $('a2m-done-title').textContent = `${name} is in your Downloads`;
  show('a2m-done');
  track('mp3-run', { result: 'ok', path: fmt, kbps: fmt === 'wav' ? 0 : kbps, codec: info.codec, sizeMb, secs: Math.round((Date.now() - t0) / 1000) });
}

$('a2m-format').addEventListener('change', estimate);
$('a2m-kbps').addEventListener('change', estimate);
$('a2m-go').addEventListener('click', run);
$('a2m-cancel').addEventListener('click', () => { conversion?.cancel(); });
input.addEventListener('change', () => { load(input.files[0]); input.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => load(e.dataTransfer.files[0]));
document.querySelectorAll('.a2m-new').forEach((b) => b.addEventListener('click', () => { $('a2m-player').removeAttribute('src'); show('a2m-idle'); input.click(); }));
$('a2m-dl').addEventListener('click', (e) => { if (e.isTrusted) track('mp3-download-again'); });
