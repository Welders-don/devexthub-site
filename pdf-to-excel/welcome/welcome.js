// Онбординг Convert PDF to Excel на сайте (с 1.1.4, Денис 31.10): после установки расширение
// открывает эту страницу вместо своей onboarding.html, чтобы каждая установка была заходом
// на devexthub.com. Вёрстка 1:1 как в расширении, тексты берём у него самого через
// externally_connectable (язык Chrome юзера, имя под пазлом на его языке, $APP$ подставлен).
// Расширение не ответило (зашли не из него, другой браузер): английский из вёрстки.
// Umami здесь нет: страница открывается сама после установки, onboarding_open шлёт расширение.
const EXT = new URLSearchParams(location.search).get('x') || 'hboeifcemhbamnoakkbalaemdleehfnf';

function show() { document.documentElement.classList.remove('wait'); }
setTimeout(show, 1500); // молчащее расширение не должно оставить пустую страницу

function ask(msg) {
  return new Promise(resolve => {
    if (!window.chrome?.runtime?.sendMessage) return resolve(null);
    try {
      chrome.runtime.sendMessage(EXT, msg, r => resolve(chrome.runtime.lastError ? null : r));
    } catch { resolve(null); }
  });
}

// **жирный** → <strong>, остальное экранировано (как markup() в sidepanel/i18n.js расширения)
function markup(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

const keys = [...new Set([...document.querySelectorAll('[data-i18n]')].map(el => el.dataset.i18n))];
ask({ type: 'WELCOME_OPEN', keys }).then(r => {
  if (r && r.strings) {
    for (const el of document.querySelectorAll('[data-i18n]')) {
      const msg = r.strings[el.dataset.i18n];
      if (!msg) continue;
      if (el.dataset.i18nMarkup !== undefined) el.innerHTML = markup(msg);
      else el.textContent = msg;
    }
    if (r.app) for (const el of document.querySelectorAll('[data-i18n-app]:not([data-i18n])')) el.textContent = r.app;
    if (r.lang) document.documentElement.lang = r.lang;
  }
  show();
});
