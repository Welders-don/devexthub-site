// Онбординг Image Enhancer на сайте (с 1.1.4, всем установившим).
// Зачем на сайте: 30 дней до 21.10 онбординг открыли 91% установивших, редактор только 56%,
// главный обрыв на этой странице, а правка внутри расширения ждёт ревью CWS.
//
// Тексты берём у самого расширения (externally_connectable пускает только www.devexthub.com):
// у него язык Chrome юзера и имя под пазлом на 52 языках. Шаг «найдите X в списке» обязан
// назвать то имя, что в списке, а у испанца это «Mejorar Calidad de Imagen».
// Расширение не ответило (зашли не из него, другой браузер): английский + кнопка в стор.
const EXT = new URLSearchParams(location.search).get('x') || 'pkkccllbjokjgkffmjcjigfajhojjlmi';

function show() { document.documentElement.classList.remove('wait'); fit(); }

// Шаги рядом (≥1000 px): масштабируем шапку, шаги и кнопку одним zoom так, чтобы всё влезло
// в окно по высоте (кнопка открытия редактора на первом экране, Денис 08.11) и шаги по ширине.
// В отличие от ET здесь и уменьшаем: макет редактора в шаге 2 высокий, на 1366×680 не влезал.
const steps = document.querySelector('.steps');
const parts = [document.querySelector('.header'), steps, document.querySelector('.cta')];
function fit() {
  parts.forEach(el => { el.style.zoom = ''; });
  if (innerWidth < 1000) return;
  steps.style.flex = 'none'; // естественная высота, а не растянутая flex'ом
  const h = parts.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
  steps.style.flex = '';
  const z = Math.max(0.6, Math.min(innerHeight * 0.96 / h, innerWidth / steps.offsetWidth, 1.6));
  if (Math.abs(z - 1) > 0.02) parts.forEach(el => { el.style.zoom = z.toFixed(3); });
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

const keys = [...new Set([...document.querySelectorAll('[data-i18n]')].map(el => el.dataset.i18n))];
ask({ type: 'WELCOME_OPEN', keys: [...keys, 'titleOnb'] }).then(r => {
  const cta = document.getElementById('cta');
  if (!r || !r.strings) {
    cta.querySelector('[data-i18n]').textContent = 'Add to Chrome · free';
    show();
    return;
  }
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const msg = r.strings[el.dataset.i18n];
    if (msg) el.textContent = msg;
  }
  if (r.strings.titleOnb) document.title = r.strings.titleOnb;
  if (r.lang) document.documentElement.lang = r.lang;
  // Редактор открывает расширение: ссылку на chrome-extension:// сайт открыть не может.
  // Umami на этой странице нет (21.10): страница открывается сама после установки, счёт
  // ведёт расширение (welcome_open / welcome_cta), сторонний счётчик тут лишний.
  cta.removeAttribute('href');
  cta.style.cursor = 'pointer';
  cta.addEventListener('click', () => ask({ type: 'OPEN_APP' }));
  show();
});
