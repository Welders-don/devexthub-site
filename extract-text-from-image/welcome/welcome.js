// Онбординг Extract Text from Image на сайте (с 1.2.8, Денис 05.11): после установки расширение
// открывает эту страницу вместо своей onboarding.html, чтобы каждая установка была заходом
// на devexthub.com. Вёрстка 1:1 как в расширении, тексты берём у него самого через
// externally_connectable (язык Chrome юзера). Только textContent, как i18n.js расширения.
// Расширение не ответило (зашли не из него, другой браузер): английский из вёрстки.
// Umami здесь нет: страница открывается сама после установки, события шлёт расширение.
const EXT = new URLSearchParams(location.search).get('x') || 'eeelkokigmnmogpibbdkjdplpfnobpjb';

function show() { document.documentElement.classList.remove('wait'); fit(); }

// На широком окне (шаги рядом) увеличиваем страницу целиком (шапка, шаги, кнопка одним
// масштабом), пока она влезает по высоте и шаги по ширине: на больших мониторах иначе
// остаются пустые полосы (Денис 05.11 «растянуть до низу»). Остаток делит flex из CSS.
const steps = document.querySelector('.steps');
const parts = [document.querySelector('.header'), steps, document.querySelector('.cta')];
function fit() {
  parts.forEach(el => { el.style.zoom = ''; });
  if (innerWidth < 1000) return;
  steps.style.flex = 'none'; // естественная высота, а не растянутая flex'ом (body min-height 100vh)
  const h = parts.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
  steps.style.flex = '';
  const z = Math.min(innerHeight * 0.96 / h, innerWidth / steps.offsetWidth, 1.6);
  if (z > 1.02) parts.forEach(el => { el.style.zoom = z.toFixed(3); });
}
addEventListener('resize', fit);
setTimeout(show, 1500); // молчащее расширение не должно оставить пустую страницу

function ask(msg) {
  return new Promise(resolve => {
    if (!window.chrome?.runtime?.sendMessage) return resolve(null);
    try {
      chrome.runtime.sendMessage(EXT, msg, r => resolve(chrome.runtime.lastError ? null : r));
    } catch { resolve(null); }
  });
}

const titleKey = document.documentElement.dataset.i18nTitle;
const keys = [...new Set([...document.querySelectorAll('[data-i18n]')].map(el => el.dataset.i18n).concat(titleKey || []))];
ask({ type: 'WELCOME_OPEN', keys }).then(r => {
  if (r && r.strings) {
    for (const el of document.querySelectorAll('[data-i18n]')) {
      const msg = r.strings[el.dataset.i18n];
      if (msg) el.textContent = msg;
    }
    if (titleKey && r.strings[titleKey]) document.title = r.strings[titleKey];
    if (r.lang) document.documentElement.lang = r.lang;
  }
  show();
});
