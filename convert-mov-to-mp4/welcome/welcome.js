// Онбординг Convert MOV to MP4 на сайте (с 1.0.7, Денис 31.10): после установки расширение
// открывает эту страницу вместо своей onboarding.html, чтобы каждая установка была заходом
// на devexthub.com. Вёрстка 1:1 как в расширении, тексты берём у него самого через
// externally_connectable (язык Chrome юзера, имя продукта на его языке).
// Расширение не ответило (зашли не из него, другой браузер): английский + кнопка в стор.
// Umami здесь нет: страница открывается сама после установки, счёт ведёт расширение
// (onboarding_open с detail=site), как у welcome Image Enhancer.
const EXT = new URLSearchParams(location.search).get('x') || 'ipeocmfcjjnbmogcigekoehhlkmdpebj';
const STORE = 'https://chromewebstore.google.com/detail/ipeocmfcjjnbmogcigekoehhlkmdpebj';

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

const start = document.getElementById('start');
const keys = [...new Set([...document.querySelectorAll('[data-i18n]')].map(el => el.dataset.i18n))];
ask({ type: 'WELCOME_OPEN', keys: [...keys, 'appName', 'obInstalled'] }).then(r => {
  if (!r || !r.strings) {
    start.textContent = 'Add to Chrome · free';
    start.addEventListener('click', () => { location.href = STORE; });
    show();
    return;
  }
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const msg = r.strings[el.dataset.i18n];
    if (msg) el.textContent = msg;
  }
  const name = r.strings.appName, installed = r.strings.obInstalled;
  if (name) document.title = installed ? `${name} — ${installed}` : name;
  if (r.lang) document.documentElement.lang = r.lang;
  if (r.dir) document.documentElement.dir = r.dir;
  // Конвертер открывает расширение: ссылку на chrome-extension:// сайт открыть не может.
  start.addEventListener('click', () => ask({ type: 'OPEN_APP' }));
  show();
});
