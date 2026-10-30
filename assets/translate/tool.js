// Перевод текста с картинки на странице /translate-picture/ (30.10). Текст даёт OCR-виджет
// (assets/ocr/tool.js, событие oxt-text). Перевод: Chrome Translator API на устройстве (Chrome 138+
// и Edge на компьютере, бесплатно), иначе бесплатный MyMemory (уходит только текст, лимит ~5000
// символов в день на IP). Картинка не покидает браузер в обоих случаях.
const $ = (id) => document.getElementById(id);
const target = $('trn-target');
const out = $('trn-text');
const note = $('trn-note');
// Код tesseract → BCP 47 (Chrome) и код MyMemory.
const LANGS = {
  eng: 'en', spa: 'es', por: 'pt', fra: 'fr', deu: 'de', ita: 'it', nld: 'nl', pol: 'pl', tur: 'tr', rus: 'ru',
  ukr: 'uk', ara: 'ar', hin: 'hi', ind: 'id', vie: 'vi', tha: 'th', chi_sim: 'zh', jpn: 'ja', kor: 'ko',
};
const MM = { zh: 'zh-CN' };
let source = 'en';
// Русская страница /ru/perevod-s-kartinki/ (30.10): тексты по <html lang>, без склонения названий языков.
const RU = document.documentElement.lang === 'ru';
const T = RU ? {
  download: (l, p) => `Скачиваю языковой пакет (${l}), только в первый раз… ${p}%`,
  same: (l) => `Текст на картинке уже на этом языке (${l}). Выберите другой язык перевода выше.`,
  translating: 'Перевожу…',
  ask: (l) => `Chrome может перевести это прямо на компьютере, один раз скачав языковой пакет (${l}).`,
  quota: 'Бесплатный лимит перевода на сегодня в этой сети исчерпан. Попробуйте завтра или откройте страницу в Chrome на компьютере: там перевод идёт на устройстве и без лимита.',
  error: 'Перевод не прошёл. Проверьте интернет и нажмите «Перевести ещё раз».',
  device: (l) => `Переведено (${l}) встроенным переводчиком Chrome прямо на вашем устройстве.`,
  online: (l) => `Переведено (${l}) бесплатным сервисом MyMemory: туда ушёл только текст, не картинка.`,
  copied: 'Скопировано', copy: 'Копировать перевод',
} : {
  download: (l, p) => `Downloading the ${l} language pack, one time only… ${p}%`,
  same: (l) => `The picture is already in ${l}. Pick another language above to translate into.`,
  translating: 'Translating…',
  ask: (l) => `Chrome can translate this on your computer after a one-time download of the ${l} language pack.`,
  quota: 'The free translation limit for today is used up on this network. Try again tomorrow, or open this page in Chrome on a computer: it translates on your device with no limit.',
  error: "The translation didn't go through. Check your connection and press Translate again.",
  device: (l) => `Translated to ${l} on your device by Chrome's built-in translator.`,
  online: (l) => `Translated to ${l} by the free MyMemory service: only the text was sent there, not the picture.`,
  copied: 'Copied', copy: 'Copy translation',
};
let job = 0;

const track = (name, data) => { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data); };
const langName = (code) => target.querySelector(`option[value="${code}"]`)?.textContent || code;

// OCR рвёт предложения по строкам картинки: строки абзаца склеиваем, абзацы (пустая строка) сохраняем.
const paragraphs = (text) => text.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);

class Quota extends Error {}

async function viaDevice(paras, src, tgt, mine) {
  const t = await window.Translator.create({
    sourceLanguage: src,
    targetLanguage: tgt,
    monitor(m) { m.addEventListener('downloadprogress', (e) => { if (mine()) note.textContent = T.download(langName(tgt), Math.round(e.loaded * 100)); }); },
  });
  const res = [];
  for (const p of paras) res.push(await t.translate(p));
  t.destroy?.();
  return res;
}

// MyMemory берёт до 500 байт за запрос: режем абзац по предложениям.
function chunks(p) {
  const parts = p.match(/[^.!?。！？]+[.!?。！？]*\s*/g) || [p];
  const res = [];
  let cur = '';
  const bytes = (s) => new TextEncoder().encode(s).length;
  for (const s of parts) {
    if (cur && bytes(cur + s) > 450) { res.push(cur); cur = ''; }
    cur += s;
    while (bytes(cur) > 450) { // одно длинное «предложение» без точек
      let cut = Math.floor(cur.length / 2);
      while (bytes(cur.slice(0, cut)) > 450) cut = Math.floor(cut / 2);
      res.push(cur.slice(0, cut)); cur = cur.slice(cut);
    }
  }
  if (cur.trim()) res.push(cur);
  return res;
}

const decode = (s) => new DOMParser().parseFromString(s, 'text/html').documentElement.textContent;

async function viaMyMemory(paras, src, tgt) {
  const pair = `${MM[src] || src}|${MM[tgt] || tgt}`;
  const res = [];
  for (const p of paras) {
    let t = '';
    for (const c of chunks(p)) {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(c.trim())}&langpair=${encodeURIComponent(pair)}`);
      const d = await r.json().catch(() => ({}));
      const txt = d.responseData?.translatedText || '';
      if (d.quotaFinished || r.status === 429 || /MYMEMORY WARNING/i.test(txt)) throw new Quota();
      if (!r.ok || Number(d.responseStatus) !== 200 || !txt) throw new Error(`mymemory ${d.responseStatus || r.status}`);
      t += (t ? ' ' : '') + decode(txt);
    }
    res.push(t);
  }
  return res;
}

async function translate(gesture = false, online = false) {
  const my = ++job;
  const mine = () => my === job;
  const src = source;
  const tgt = target.value;
  const text = $('oxt-text').value.trim();
  $('trn-device').hidden = true;
  $('trn-online').hidden = true;
  if (!text) return;
  if (src === tgt) {
    out.value = '';
    note.textContent = T.same(langName(src));
    return;
  }
  const paras = paragraphs(text);
  const started = Date.now();
  out.value = '';
  note.textContent = T.translating;
  let engine = 'mymemory';
  if ('Translator' in self && !online) {
    // availability() может не ответить вовсе (headless Chrome 145 висит бесконечно): 4 с и считаем, что API нет.
    const a = await Promise.race([
      window.Translator.availability({ sourceLanguage: src, targetLanguage: tgt }).catch(() => 'unavailable'),
      new Promise((res) => setTimeout(() => res('timeout'), 4000)),
    ]);
    if (!mine()) return;
    const active = gesture || navigator.userActivation?.isActive;
    if (a === 'available' || ((a === 'downloadable' || a === 'downloading') && active)) engine = 'device';
    else if (a === 'downloadable' || a === 'downloading') {
      // Скачать языковой пакет Chrome даёт только по клику: спрашиваем, а не уходим молча в MyMemory.
      note.textContent = T.ask(langName(tgt));
      $('trn-device').hidden = false;
      $('trn-online').hidden = false;
      track('trn-run', { result: 'ask-download', src, tgt });
      return;
    }
  }
  if (engine === 'mymemory') note.textContent = T.translating;
  let res;
  try {
    res = engine === 'device' ? await viaDevice(paras, src, tgt, mine) : await viaMyMemory(paras, src, tgt);
  } catch (err) {
    if (!mine()) return;
    const quota = err instanceof Quota;
    note.textContent = quota
      ? T.quota
      : T.error;
    track('trn-run', { result: quota ? 'quota' : 'error', engine, src, tgt, err: String(err?.message || err).slice(0, 40) });
    return;
  }
  if (!mine()) return;
  out.value = res.join('\n\n');
  note.textContent = engine === 'device'
    ? T.device(langName(tgt))
    : T.online(langName(tgt));
  track('trn-run', { result: 'ok', engine, src, tgt, chars: text.length, secs: Math.round((Date.now() - started) / 1000) });
}

document.addEventListener('oxt-text', (e) => {
  source = LANGS[e.detail.lang] || 'en';
  // По умолчанию на английский; картинка уже английская → на язык браузера (или испанский).
  if (source === 'en' && target.value === 'en') {
    const nav = (navigator.language || 'es').slice(0, 2);
    target.value = nav !== 'en' && target.querySelector(`option[value="${nav}"]`) ? nav : 'es';
  }
  if (source !== 'en' && target.value === source) target.value = 'en';
  translate();
});
target.addEventListener('change', () => translate(true));
$('trn-go').addEventListener('click', () => translate(true));
$('trn-device').addEventListener('click', () => translate(true));
$('trn-online').addEventListener('click', () => translate(true, true));
$('trn-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(out.value); } catch { out.select(); document.execCommand('copy'); }
  $('trn-copy').textContent = T.copied;
  setTimeout(() => { $('trn-copy').textContent = T.copy; }, 1500);
  track('trn-copy');
});
