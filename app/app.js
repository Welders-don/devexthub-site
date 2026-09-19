/* Кабинет /app. Данные берём у бэкенда Капитана, живём на куке dvx_sid.
   Вход: ?state=<nonce> из расширения (билет) + ?t=<id> — какой транскрипт открыть. */

(function () {
  var API = 'https://transcribe.devexthub.com:8443/api/site';

  var el = {
    loading: document.getElementById('loading'),
    empty: document.getElementById('empty'),
    app: document.getElementById('app'),
    list: document.getElementById('list'),
    detail: document.getElementById('detail'),
    retention: document.getElementById('retention'),
    signin: document.getElementById('signin'),
  };

  var state = { items: [], gateAfter: 3, used: 0, signedIn: false, openId: null, days: 30, daysSignedIn: 90,
                quota: 6, windowUsed: 0, nextReset: null, clientId: null, email: null };
  var t = window.I18N.t;

  function api(path, opts) {
    return fetch(API + path, Object.assign({ credentials: 'include' }, opts || {}));
  }

  function show(which) {
    el.loading.classList.toggle('hidden', which !== 'loading');
    el.empty.classList.toggle('hidden', which !== 'empty');
    el.app.classList.toggle('hidden', which !== 'app');
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function fmtDur(sec) {
    if (!sec) return '';
    return t('minutes', { n: Math.round(sec / 60) });
  }

  /* ---------- список ---------- */

  function renderList() {
    el.list.textContent = '';
    if (!state.items.length) {
      var p = document.createElement('p');
      p.className = 'muted';
      p.style.padding = '16px';
      p.textContent = t('list_empty');
      el.list.appendChild(p);
      return;
    }

    state.items.forEach(function (it) {
      var btn = document.createElement('button');
      btn.className = 'item' + (it.id === state.openId ? ' on' : '');
      btn.type = 'button';

      var meta = document.createElement('div');
      meta.className = 'meta';
      var left = document.createElement('span');
      left.textContent = (it.platform || 'other') + ' · ' + fmtDate(it.created_at);
      var right = document.createElement('span');
      right.textContent = it.has_summary ? t('has_summary') : fmtDur(it.duration_sec);
      if (it.has_summary) right.className = 'dot-sum';
      meta.appendChild(left);
      meta.appendChild(right);

      var prev = document.createElement('div');
      prev.className = 'prev';
      prev.textContent = it.preview || '';

      btn.appendChild(meta);
      btn.appendChild(prev);
      btn.addEventListener('click', function () { open(it.id); });
      el.list.appendChild(btn);
    });
  }

  /* ---------- один транскрипт ---------- */

  function open(id, autoSummary) {
    state.openId = id;
    renderList();
    el.detail.textContent = '';
    var wait = document.createElement('p');
    wait.className = 'muted';
    wait.textContent = t('loading_short');
    el.detail.appendChild(wait);

    api('/transcriptions/' + id)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        renderDetail(data);
        if (autoSummary && !data.summary_text) summarize(id);
      })
      .catch(function () {
        el.detail.textContent = '';
        var p = document.createElement('p');
        p.className = 'err';
        p.textContent = t('load_fail');
        el.detail.appendChild(p);
      });
  }

  function renderDetail(data) {
    el.detail.textContent = '';

    var head = document.createElement('div');
    head.className = 'detail-head';

    var meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = (data.platform || 'other') + ' · ' + fmtDate(data.created_at) +
                       (data.duration_sec ? ' · ' + fmtDur(data.duration_sec) : '');

    var actions = document.createElement('div');
    actions.className = 'actions';

    if (!data.summary_text) {
      var sumBtn = document.createElement('button');
      sumBtn.className = 'btn small js-sum';
      sumBtn.type = 'button';
      sumBtn.textContent = t('summarize');
      var badge = document.createElement('span');
      badge.className = 'beta';
      badge.textContent = t('beta');
      sumBtn.appendChild(badge);
      sumBtn.addEventListener('click', function () { summarize(data.id); });
      actions.appendChild(sumBtn);
    }

    actions.appendChild(downloadBtn('TXT', data, 'txt'));
    actions.appendChild(downloadBtn('Word', data, 'doc'));

    head.appendChild(meta);
    head.appendChild(actions);
    el.detail.appendChild(head);

    if (data.summary_text) el.detail.appendChild(summaryBlock(data.summary_text));

    var body = document.createElement('div');
    body.className = 'transcript';
    body.textContent = data.transcript_text || '';
    el.detail.appendChild(body);
  }

  function summaryBlock(text) {
    var box = document.createElement('div');
    box.className = 'summary';
    var h = document.createElement('h3');
    h.textContent = t('summary_title');
    var p = document.createElement('div');
    p.textContent = text;
    box.appendChild(h);
    box.appendChild(p);
    return box;
  }

  /* ---------- саммари ---------- */

  function summarize(id) {
    // Саммари длинного видео идёт до минуты. Без движущегося индикатора это читается
    // как «залипло» (Денис, 19.09), поэтому: кнопка гаснет, полоска едет, срок назван.
    var btn = el.detail.querySelector('.js-sum');
    if (btn) {
      btn.disabled = true;
      btn.textContent = t('summarizing_btn');
    }

    var placeholder = document.createElement('div');
    placeholder.className = 'summary working';

    var label = document.createElement('div');
    label.textContent = t('summarizing');
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.appendChild(document.createElement('span'));
    var hint = document.createElement('div');
    hint.className = 'muted hint';
    hint.textContent = t('summarizing_hint');

    placeholder.appendChild(label);
    placeholder.appendChild(bar);
    placeholder.appendChild(hint);
    el.detail.insertBefore(placeholder, el.detail.children[1] || null);

    api('/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription_id: id }),
    })
      .then(function (r) {
        if (r.status === 402) return r.json().then(function (d) {
          if (d && d.next_reset) state.nextReset = d.next_reset;
          throw (d && d.error === 'QUOTA') ? 'QUOTA' : 'GATE';
        });
        if (!r.ok) throw 'FAIL';
        return r.json();
      })
      .then(function (data) {
        el.detail.replaceChild(summaryBlock(data.summary), placeholder);
        if (btn) btn.remove(); // саммари уже есть — предлагать сделать его ещё раз незачем
        state.used += 1;
        var item = state.items.filter(function (i) { return i.id === id; })[0];
        if (item) { item.has_summary = true; renderList(); }
      })
      .catch(function (why) {
        el.detail.replaceChild(
          why === 'GATE' ? gateBlock() : why === 'QUOTA' ? quotaBlock() : failBlock(),
          placeholder
        );
        // отказ по лимиту повтором не лечится, а вот сбой — да, поэтому кнопку возвращаем
        if (btn && why !== 'GATE' && why !== 'QUOTA') {
          btn.disabled = false;
          btn.textContent = t('summarize');
        } else if (btn) {
          btn.remove();
        }
      });
  }

  function gateBlock() {
    var box = document.createElement('div');
    box.className = 'gate';
    var b = document.createElement('b');
    b.textContent = t('gate_title', { n: state.gateAfter });
    var p = document.createElement('div');
    p.textContent = t('gate_body', { days: state.daysSignedIn || 90 });
    box.appendChild(b);
    box.appendChild(p);

    // Гейт — единственное место, где вход человеку реально нужен прямо сейчас,
    // поэтому кнопка стоит тут же, а не только в шапке.
    var here = document.createElement('div');
    here.className = 'gate-signin';
    box.appendChild(here);
    renderSignIn(here);

    return box;
  }

  function quotaBlock() {
    var box = document.createElement('div');
    box.className = 'gate';
    var b = document.createElement('b');
    b.textContent = t('quota_title');
    var p = document.createElement('div');
    p.textContent = t('quota_body', { date: fmtDay(state.nextReset) });
    box.appendChild(b);
    box.appendChild(p);
    return box;
  }

  function fmtDay(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function failBlock() {
    var p = document.createElement('div');
    p.className = 'summary err';
    p.textContent = t('summary_fail');
    return p;
  }

  /* ---------- скачивание ---------- */

  function downloadBtn(label, data, kind) {
    var b = document.createElement('button');
    b.className = 'btn ghost small';
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', function () { download(data, kind); });
    return b;
  }

  function download(data, kind) {
    var name = 'transcript-' + data.id;
    var blob;

    if (kind === 'doc') {
      // .doc как HTML-обёртка — так же, как делает панель расширения
      var esc = document.createElement('div');
      esc.textContent = (data.summary_text ? t('summary_title') + '\n' + data.summary_text + '\n\n' : '') + (data.transcript_text || '');
      blob = new Blob(
        ['<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body><pre>' +
         esc.innerHTML + '</pre></body></html>'],
        { type: 'application/msword' }
      );
      name += '.doc';
    } else {
      blob = new Blob(
        [(data.summary_text ? t('summary_title').toUpperCase() + '\n' + data.summary_text + '\n\n---\n\n' : '') + (data.transcript_text || '')],
        { type: 'text/plain;charset=utf-8' }
      );
      name += '.txt';
    }

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- вход через Google ---------- */

  /* Скрипт GIS грузится асинхронно и может опоздать к первой отрисовке — ждём его,
     но не вечно: без кнопки кабинет остаётся рабочим, просто без входа. */
  function withGsi(cb, tries) {
    if (window.google && window.google.accounts && window.google.accounts.id) return cb();
    if ((tries || 0) > 20) return;
    setTimeout(function () { withGsi(cb, (tries || 0) + 1); }, 250);
  }

  var gsiReady = false;

  function onCredential(resp) {
    api('/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: resp.credential }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function () { loadMe(state.openId); })
      .catch(function () {
        var box = document.getElementById('signin');
        if (box) { box.textContent = ''; box.appendChild(errSpan(t('sign_in_fail'))); }
      });
  }

  function errSpan(text) {
    var s = document.createElement('span');
    s.className = 'err';
    s.textContent = text;
    return s;
  }

  // Кнопку рисует сам Google в наш контейнер — свой стиль ей не навязываем,
  // иначе она перестаёт быть узнаваемой (и это против правил бренда Google).
  function renderSignIn(box) {
    if (!box || !state.clientId || state.signedIn) return;
    withGsi(function () {
      if (!gsiReady) {
        window.google.accounts.id.initialize({
          client_id: state.clientId,
          callback: onCredential,
        });
        gsiReady = true;
      }
      box.textContent = '';
      window.google.accounts.id.renderButton(box, { type: 'standard', size: 'medium', locale: window.I18N.lang });
    });
  }

  function loadMe(openId, auto) {
    return api('/me')
      .then(function (r) {
        if (r.status === 401) { show('empty'); return null; }
        if (!r.ok) throw new Error('me failed');
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        state.items = data.transcriptions || [];
        state.gateAfter = data.gate_after || 3;
        state.used = data.summaries_used || 0;
        state.signedIn = !!data.signed_in;
        state.days = data.retention_days || 30;
        state.daysSignedIn = data.retention_signed_in || 90;
        state.quota = data.signed_quota || 6;
        state.windowUsed = data.window_used || 0;
        state.nextReset = data.next_reset || null;
        state.clientId = data.client_id || null;
        state.email = data.email || null;
        el.retention.textContent = t('retention', { n: state.days });
        if (!state.signedIn) el.retention.title = t('retention_hint', { n: state.daysSignedIn });
        el.signin.textContent = '';
        if (state.signedIn) el.signin.textContent = t('signed_as', { email: state.email || '' });
        else renderSignIn(el.signin);
        show('app');
        renderList();

        var first = openId || (state.items[0] && state.items[0].id);
        if (first) open(first, auto === true);
      })
      .catch(function () { show('empty'); });
  }

  function start() {
    window.I18N.apply();
    document.title = t('title');
    var q = new URLSearchParams(location.search);
    var nonce = q.get('state');
    var wanted = Number(q.get('t')) || null;
    var auto = q.get('summary') === '1'; // из панели нажали Summary — считаем сразу

    // билет из адреса убираем сразу, чтобы он не оседал в истории и реферерах
    if (nonce || wanted || auto) history.replaceState(null, '', location.pathname);

    if (!nonce) return loadMe(wanted, auto);

    api('/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nonce: nonce }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) { return loadMe(wanted || data.transcription_id || null, auto); })
      .catch(function () { return loadMe(wanted, auto); });
  }

  start();
})();
