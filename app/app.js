/* Кабинет /app. Данные берём у бэкенда Капитана, живём на куке dvx_sid.
   Вход: ?state=<nonce> из расширения (билет) + ?t=<id> — какой транскрипт открыть. */

(function () {
  var API = 'https://transcribe.devexthub.com:8443/api/site';

  var el = {
    loading: document.getElementById('loading'),
    empty: document.getElementById('empty'),
    signinEmpty: document.getElementById('signinEmpty'),
    signinEmptyMsg: document.getElementById('signinEmptyMsg'),
    emptyNew: document.getElementById('emptyNew'),
    emptyBack: document.getElementById('emptyBack'),
    emptyCta: document.getElementById('emptyCta'),
    app: document.getElementById('app'),
    list: document.getElementById('list'),
    detail: document.getElementById('detail'),
    retention: document.getElementById('retention'),
    signin: document.getElementById('signin'),
    earlierNote: document.getElementById('earlierNote'),
  };

  var state = { items: [], gateAfter: 3, used: 0, minChars: 500, signedIn: false, openId: null, days: 30, daysSignedIn: 90,
                quota: 6, windowUsed: 0, nextReset: null, clientId: null, email: null, noStamps: false };
  var t = window.I18N.t;

  function api(path, opts) {
    return fetch(API + path, Object.assign({ credentials: 'include' }, opts || {}));
  }

  // Отметка «на этом браузере уже входили». Отпечаток для этого не годится: он плывёт
  // после обновления Chrome и совпадает у разных людей, поэтому в SAME_ACCOUNT его нет.
  var SEEN_KEY = 'dvx_signed_before';

  function wasSignedBefore() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; }
  }

  function rememberSignedIn() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* приватный режим — не беда */ }
  }

  function show(which) {
    el.loading.classList.toggle('hidden', which !== 'loading');
    el.empty.classList.toggle('hidden', which !== 'empty');
    el.app.classList.toggle('hidden', which !== 'app');
    // Вернувшемуся не нужны ни «что это за страница», ни кнопка «установить расширение» —
    // он всё это знает, ему нужен только вход.
    if (which === 'empty') {
      var back = wasSignedBefore();
      el.emptyNew.classList.toggle('hidden', back);
      el.emptyBack.classList.toggle('hidden', !back);
      el.emptyCta.classList.toggle('hidden', back);
    }
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  /* В базе транскрипт лежит одной строкой: расширение склеивает сегменты через пробел
     перед отправкой. Пока в записи нет сегментов, режем текст на абзацы сами —
     иначе это стена в 56 тысяч знаков без единого перевода строки (жалоба Дениса 19.09). */
  function sentences(text) {
    // Intl.Segmenter знает границы предложений в китайском и японском, где точки другие
    // и пробелов нет. Регулярка — запасной путь для браузеров постарше.
    if (window.Intl && Intl.Segmenter) {
      try {
        var seg = new Intl.Segmenter(window.I18N.lang, { granularity: 'sentence' });
        return [...seg.segment(String(text || ''))].map(function (s) { return s.segment; });
      } catch (e) { /* падаем на регулярку */ }
    }
    return String(text || '').split(/(?<=[.!?…。！？])\s+/);
  }

  function paragraphs(text) {
    var parts = sentences(text);
    var out = [];
    var cur = '';
    for (var i = 0; i < parts.length; i++) {
      cur += (cur ? ' ' : '') + parts[i];
      if (cur.length >= 420) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out;
  }

  /* Сегменты приходят по 3-5 секунд (у часового видео их под две тысячи), и строка на
     каждый — нечитаемо. Собираем в абзацы ровно по тем же правилам, что панель
     расширения в groupSegments: режем на конце предложения после 150 знаков, по паузе
     длиннее 8 секунд или по 300 знакам. Таймкод — начало абзаца. */
  function groupSegments(segs) {
    var out = [];
    var cur = null;
    var endsSentence = function (s) { return /[.?!…。！？]$/.test(s.replace(/\s+$/, '')); };

    segs.forEach(function (s) {
      var text = String(s.text || '').trim();
      if (!text) return;
      if (!cur) { cur = { t: s.t, text: text, end: s.t, s: s.s }; return; }

      var gap = s.t - cur.end;
      // смена говорящего рвёт абзац так же, как длинная пауза: иначе реплики двух людей
      // склеиваются в один кусок и метка врёт
      var speakerChanged = s.s != null && cur.s != null && s.s !== cur.s;
      if ((cur.text.length > 150 && endsSentence(cur.text)) || gap > 8 || cur.text.length > 300 || speakerChanged) {
        out.push(cur);
        cur = { t: s.t, text: text, end: s.t, s: s.s };
      } else {
        cur.text += ' ' + text;
        cur.end = s.t;
        if (cur.s == null) cur.s = s.s;
      }
    });

    if (cur) out.push(cur);
    return out;
  }

  function fmtTime(sec) {
    // floor, а не round: таймкод должен указывать на момент, который УЖЕ прозвучал,
    // иначе 75.5 сек показывается как 1:16 и перескакивает реплику
    var s = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(r).padStart(2, '0');
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

    // Заголовок появился только в записях с 1.2.8 — у прежних названия взять неоткуда,
    // и тогда шапка остаётся как была, без пустой строки (запрос Дениса 19.09).
    if (data.title) {
      var h = document.createElement('h2');
      h.className = 'detail-title';
      h.textContent = data.title;
      el.detail.appendChild(h);
    }

    var head = document.createElement('div');
    head.className = 'detail-head';

    var meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = (data.platform || 'other') + ' · ' + fmtDate(data.created_at) +
                       (data.duration_sec ? ' · ' + fmtDur(data.duration_sec) : '');

    var actions = document.createElement('div');
    actions.className = 'actions';

    // Огрызок в пару фраз саммари не улучшит (аудит 24.09) — вместо кнопки честная подсказка.
    if (!data.summary_text && (data.transcript_text || '').length < state.minChars) {
      var short = document.createElement('span');
      short.className = 'muted small-note';
      short.textContent = t('too_short');
      actions.appendChild(short);
    } else if (!data.summary_text) {
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

    // Выбор вида выгрузки есть у конкурента и оказался нужен (Денис, 19.09).
    // Показываем только там, где он что-то меняет — то есть когда таймкоды вообще есть.
    if (data.segments && data.segments.length) {
      var lab = document.createElement('label');
      lab.className = 'stamp-toggle';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !state.noStamps;
      cb.addEventListener('change', function () {
        state.noStamps = !cb.checked;
        try { localStorage.setItem('dvx_no_stamps', state.noStamps ? '1' : ''); } catch (e) {}
      });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(' ' + t('with_stamps')));
      actions.appendChild(lab);
    }

    actions.appendChild(downloadBtn('TXT', data, 'txt'));
    actions.appendChild(downloadBtn('Word', data, 'doc'));

    head.appendChild(meta);
    head.appendChild(actions);
    el.detail.appendChild(head);

    if (data.summary_text) el.detail.appendChild(summaryBlock(data.summary_text, data.id, data.summary_vote));

    el.detail.appendChild(transcriptBlock(data));
  }

  /* Две дороги: у новых записей есть сегменты с таймкодами — показываем как в панели;
     у старых их нет, и текст режется на абзацы на лету. */
  function transcriptBlock(data) {
    var box = document.createElement('div');
    box.className = 'transcript';

    if (data.segments && data.segments.length) {
      groupSegments(data.segments).forEach(function (p) {
        var row = document.createElement('div');
        row.className = 'seg';
        var time = document.createElement('span');
        time.className = 'seg-time';
        time.textContent = fmtTime(p.t);
        var txt = document.createElement('span');
        txt.textContent = p.text;
        row.appendChild(time);
        if (p.s != null) {
          var who = document.createElement('span');
          who.className = 'seg-speaker';
          who.textContent = t('speaker', { n: p.s + 1 });
          row.appendChild(who);
        }
        row.appendChild(txt);
        box.appendChild(row);
      });
      return box;
    }

    paragraphs(data.transcript_text).forEach(function (p) {
      var el = document.createElement('p');
      el.className = 'para';
      el.textContent = p;
      box.appendChild(el);
    });
    return box;
  }

  function summaryBlock(text, id, vote) {
    var box = document.createElement('div');
    box.className = 'summary';
    var h = document.createElement('h3');
    h.textContent = t('summary_title');
    var p = document.createElement('div');
    p.textContent = text;
    box.appendChild(h);
    box.appendChild(p);
    box.appendChild(summaryFoot(text, id, vote));
    return box;
  }

  // Единственный сигнал качества саммари (до 24.09 кабинет не слал ни одного события).
  function sendFeedback(id, kind) {
    return api('/summary/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription_id: id, kind: kind }),
    }).catch(function () { /* отклик не стоит ошибки на экране */ });
  }

  function summaryFoot(text, id, vote) {
    var foot = document.createElement('div');
    foot.className = 'sum-foot';

    var copy = document.createElement('button');
    copy.className = 'btn ghost small';
    copy.type = 'button';
    copy.textContent = t('sum_copy');
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(text).then(function () {
        copy.textContent = t('sum_copied');
        setTimeout(function () { copy.textContent = t('sum_copy'); }, 1500);
        sendFeedback(id, 'copy');
      });
    });
    foot.appendChild(copy);

    // вопрос и обе кнопки держим одной группой: на 360 px 👎 отрывался на новую строку
    var group = document.createElement('span');
    group.className = 'sum-vote';
    var ask = document.createElement('span');
    ask.className = 'muted';
    ask.textContent = t('sum_useful');
    group.appendChild(ask);

    var up = voteBtn('👍', vote === 1);
    var down = voteBtn('👎', vote === -1);
    up.addEventListener('click', function () { pick(up, down, 'up'); });
    down.addEventListener('click', function () { pick(down, up, 'down'); });
    group.appendChild(up);
    group.appendChild(down);
    foot.appendChild(group);

    function pick(on, off, kind) {
      on.classList.add('on');
      on.setAttribute('aria-pressed', 'true');
      off.classList.remove('on');
      off.setAttribute('aria-pressed', 'false');
      sendFeedback(id, kind);
    }
    return foot;
  }

  function voteBtn(label, on) {
    var b = document.createElement('button');
    b.className = 'vote' + (on ? ' on' : '');
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    return b;
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
        if (r.status === 422) throw 'SHORT';
        if (r.status === 402) return r.json().then(function (d) {
          if (d && d.next_reset) state.nextReset = d.next_reset;
          throw (d && d.error === 'QUOTA') ? 'QUOTA' : 'GATE';
        });
        if (!r.ok) throw 'FAIL';
        return r.json();
      })
      .then(function (data) {
        el.detail.replaceChild(summaryBlock(data.summary, id, null), placeholder);
        if (btn) btn.remove(); // саммари уже есть — предлагать сделать его ещё раз незачем
        state.used += 1;
        var item = state.items.filter(function (i) { return i.id === id; })[0];
        if (item) { item.has_summary = true; renderList(); }
      })
      .catch(function (why) {
        // Автозапуск из панели по короткой записи: подсказка «слишком коротко» уже стоит
        // у кнопок, второй раз её не рисуем (запрос всё равно нужен — сервер считает отказ).
        if (why === 'SHORT' && !btn) { placeholder.remove(); return; }
        el.detail.replaceChild(
          why === 'GATE' ? gateBlock() : why === 'QUOTA' ? quotaBlock()
            : why === 'SHORT' ? shortBlock() : failBlock(),
          placeholder
        );
        // отказ по лимиту и по длине повтором не лечится, а вот сбой — да, поэтому кнопку возвращаем
        if (btn && why !== 'GATE' && why !== 'QUOTA' && why !== 'SHORT') {
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

  function shortBlock() {
    var p = document.createElement('div');
    p.className = 'summary';
    p.textContent = t('too_short');
    return p;
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

  // В файл уходит тот же читаемый вид, что на экране: с таймкодами, если они есть,
  // иначе абзацами. Скачанная стена в 56 тысяч знаков одной строкой — то, с чего начали.
  function bodyForFile(data) {
    if (data.segments && data.segments.length && !state.noStamps) {
      // абзац и его таймкод разными строками: в Word это читается как текст с метками,
      // а не как расшифровка субтитров по одному предложению
      return groupSegments(data.segments)
        .map(function (p) {
          var who = p.s != null ? ' ' + t('speaker', { n: p.s + 1 }) : '';
          return '[' + fmtTime(p.t) + ']' + who + '\n' + p.text;
        })
        .join('\n\n');
    }
    // Без таймкодов текст всё равно должен делиться на абзацы — у конкурента с 200k
    // установок ровно два вида выгрузки, и второй это не сплошняк (Денис, 19.09).
    if (data.segments && data.segments.length) {
      return groupSegments(data.segments).map(function (p) { return p.text; }).join('\n\n');
    }
    return paragraphs(data.transcript_text).join('\n\n');
  }

  function download(data, kind) {
    var name = 'transcript-' + data.id;
    var blob;

    if (kind === 'doc') {
      // .doc как HTML-обёртка — так же, как делает панель расширения: сверху название
      // и дата, дальше текст. До 19.09 файл начинался прямо с голого текста.
      var esc = document.createElement('div');
      esc.textContent = (data.summary_text ? t('summary_title') + '\n' + data.summary_text + '\n\n' : '') + bodyForFile(data);
      var head = document.createElement('div');
      head.textContent = data.title || '';
      blob = new Blob(
        ['<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>' +
         (data.title ? '<h2>' + head.innerHTML + '</h2>' : '') +
         '<p style="color:#888">' + fmtDate(data.created_at) + '</p>' +
         '<pre>' + esc.innerHTML + '</pre></body></html>'],
        { type: 'application/msword' }
      );
      name += '.doc';
    } else {
      blob = new Blob(
        [(data.title ? data.title + '\n' + fmtDate(data.created_at) + '\n\n' : '') +
         (data.summary_text ? t('summary_title').toUpperCase() + '\n' + data.summary_text + '\n\n---\n\n' : '') + bodyForFile(data)],
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

  // Вход с устройства, где расширения нет: билета взять неоткуда, человек доказывает,
  // что он это он, самим входом в Google. Без этого библиотека читалась только с той
  // машины, где стоит панель (Денис, 19.09).
  function onLoginCredential(resp) {
    el.signinEmptyMsg.classList.add('hidden');
    api('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: resp.credential }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status === 404 ? 'NO_ACCOUNT' : 'FAIL'); })
      .then(function () { show('loading'); loadMe(); })
      .catch(function (why) {
        // «мы тебя не знаем» — не ошибка человека, он просто здесь впервые: красный тут
        // лишняя тревога (Денис, 19.09). Красным остаётся только настоящий сбой входа.
        var unknown = why === 'NO_ACCOUNT';
        el.signinEmptyMsg.textContent = t(unknown ? 'login_no_account' : 'sign_in_fail');
        el.signinEmptyMsg.className = unknown ? 'muted' : 'err';
      });
  }

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
    drawGoogleButton(box, onCredential);
  }

  // На пустом экране и в кабинете обработчики разные (там вход без билета, тут привязка
  // к текущей установке), поэтому initialize зовём перед каждой отрисовкой.
  function drawGoogleButton(box, callback) {
    if (!box || !state.clientId) return;
    withGsi(function () {
      window.google.accounts.id.initialize({ client_id: state.clientId, callback: callback });
      gsiReady = true;
      box.textContent = '';
      window.google.accounts.id.renderButton(box, { type: 'standard', size: 'medium', locale: window.I18N.lang });
    });
  }

  // На пустом экране сессии нет, а значит нет и ответа /me с client_id — берём его
  // отдельным публичным запросом, чтобы не держать копию в статике сайта.
  function offerLogin() {
    if (state.clientId) return drawGoogleButton(el.signinEmpty, onLoginCredential);
    api('/config')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (cfg) {
        if (!cfg.client_id) return;
        state.clientId = cfg.client_id;
        drawGoogleButton(el.signinEmpty, onLoginCredential);
      })
      .catch(function () { /* без кнопки страница остаётся рабочей */ });
  }

  function loadMe(openId, auto) {
    return api('/me')
      .then(function (r) {
        if (r.status === 401) { show('empty'); offerLogin(); return null; }
        if (!r.ok) throw new Error('me failed');
        return r.json();
      })
      .then(function (data) {
        if (!data) return;
        state.items = data.transcriptions || [];
        state.gateAfter = data.gate_after || 3;
        state.used = data.summaries_used || 0;
        state.minChars = data.summary_min_chars || 500;
        state.signedIn = !!data.signed_in;
        // одна точка на оба пути входа: и по билету из расширения, и кнопкой на пустом экране
        if (state.signedIn) rememberSignedIn();
        state.days = data.retention_days || 30;
        state.daysSignedIn = data.retention_signed_in || 90;
        state.quota = data.signed_quota || 6;
        state.windowUsed = data.window_used || 0;
        state.nextReset = data.next_reset || null;
        state.clientId = data.client_id || null;
        state.email = data.email || null;
        el.retention.textContent = t('retention', { n: state.days });
        if (!state.signedIn) el.retention.title = t('retention_hint', { n: state.daysSignedIn });
        // Переустановка: записи прежней установки на этом компьютере здесь не видны
        // (по отпечатку их не отдаём). Честно говорим, куда делись и как не терять дальше.
        el.earlierNote.classList.toggle('hidden', !(data.earlier_install && !state.signedIn));
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
    // выбор вида выгрузки живёт между визитами: выбрал раз — больше не переключаешь
    try { state.noStamps = localStorage.getItem('dvx_no_stamps') === '1'; } catch (e) {}
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
