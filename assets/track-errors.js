// Ошибки JS на страницах-инструментах → Umami-событие js-error {path, msg, src} (30.10.2026).
// Подключается первым скриптом в <head>, чтобы поймать и ошибки при загрузке. Не больше 3 на визит.
// Чужие ошибки (расширения браузера) пропускаем. Пока Umami не загрузился (defer), копим в очередь.
(function () {
  var sent = 0;
  var queue = [];
  function ready() { return window.umami && typeof window.umami.track === 'function'; }
  function send(msg, src) {
    if (sent >= 3) return;
    sent++;
    var data = { path: location.pathname, msg: String(msg || '').slice(0, 90), src: String(src || '').replace(location.origin, '').slice(0, 80) };
    if (ready()) window.umami.track('js-error', data); else queue.push(data);
  }
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window) {
      // Не загрузился наш скрипт или модуль (картинки и чужие пиксели не считаем).
      if (t.tagName === 'SCRIPT' && t.src && t.src.indexOf('/u/script.js') === -1) send('script load failed', t.src);
      return;
    }
    if (/^(chrome|moz|safari)-extension:/.test(e.filename || '')) return;
    send(e.message, (e.filename || '') + ':' + (e.lineno || 0));
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    if (r && /extension:\/\//.test(String(r.stack || ''))) return;
    send('unhandled: ' + (r && (r.message || r.name) || String(r)), 'promise');
  });
  var tries = 0;
  var timer = setInterval(function () {
    if (ready()) { queue.forEach(function (d) { window.umami.track('js-error', d); }); queue = []; clearInterval(timer); }
    if (++tries > 30) clearInterval(timer);
  }, 1000);
})();
