// Гейт: во всех локалях кабинета одинаковый набор ключей, плейсхолдеры на месте,
// и каждый ключ из разметки/логики существует. Запуск: node tools/test_i18n_keys.mjs
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../app/i18n.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');

// вытаскиваем словарь из файла, не исполняя страницу целиком
const stub = { navigator: { languages: ['en'], language: 'en' }, document: { documentElement: {}, querySelectorAll: () => [] }, window: {} };
const fn = new Function('window', 'document', 'navigator', src + '\n;return window.I18N;');
const I18N = fn(stub.window, stub.document, stub.navigator);

const dictMatch = src.match(/var DICT = \{[\s\S]*?\n  \};/);
if (!dictMatch) { console.error('❌ словарь не найден'); process.exit(1); }

const langs = I18N.langs;
const base = 'en';
const fails = [];

// собираем ключи каждой локали по исходнику
const perLang = {};
for (const lang of langs) {
  const re = new RegExp('\\n    ' + lang + ': \\{([\\s\\S]*?)\\n    \\},');
  const body = src.match(re);
  if (!body) { fails.push(`локаль ${lang} не разобралась`); continue; }
  perLang[lang] = [...body[1].matchAll(/^\s{6}([a-z_]+):/gm)].map((m) => m[1]);
}

const baseKeys = perLang[base];
for (const lang of langs) {
  if (lang === base) continue;
  const miss = baseKeys.filter((k) => !perLang[lang].includes(k));
  const extra = perLang[lang].filter((k) => !baseKeys.includes(k));
  if (miss.length) fails.push(`${lang}: нет ключей ${miss.join(', ')}`);
  if (extra.length) fails.push(`${lang}: лишние ключи ${extra.join(', ')}`);
}

// плейсхолдеры {n} / {days} должны сохраняться в переводе
for (const key of baseKeys) {
  const ph = (I18N.t(key).match(/\{[a-z]+\}/g) || []).sort().join(',');
  for (const lang of langs) {
    const row = src.match(new RegExp('\\n    ' + lang + ': \\{[\\s\\S]*?\\n      ' + key + ": '([^']*)'"));
    if (!row) continue;
    const got = (row[1].match(/\{[a-z]+\}/g) || []).sort().join(',');
    if (ph !== got) fails.push(`${lang}.${key}: плейсхолдеры "${got}" вместо "${ph}"`);
  }
}

// ключи, которые реально используются
const used = new Set([
  ...[...html.matchAll(/data-i18n(?:-html)?="([a-z_]+)"/g)].map((m) => m[1]),
  ...[...js.matchAll(/\bt\('([a-z_]+)'/g)].map((m) => m[1]),
]);
for (const k of used) if (!baseKeys.includes(k)) fails.push(`используется ключ "${k}", которого нет в словаре`);
const unused = baseKeys.filter((k) => !used.has(k));

console.log(`локалей: ${langs.length} (${langs.join(', ')})`);
console.log(`ключей в каждой: ${baseKeys.length}`);
if (unused.length) console.log(`не используются: ${unused.join(', ')}`);
if (fails.length) { console.log('\n' + fails.map((f) => '❌ ' + f).join('\n')); process.exit(1); }
console.log('✅ ключи и плейсхолдеры сходятся во всех локалях');
