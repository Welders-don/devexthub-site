# Devexthub-site — карта проекта (реперные точки)
> Стабильная шапка. Читать ПЕРВОЙ при вопросе по проекту. Детали — в _handoff.md/knowledge/.

## Что это (назначение: сайт-хаб, домен, что содержит)
Статический маркетинговый сайт-хаб для линейки Chrome-расширений Devexthub.
Домен: <b>www.devexthub.com</b>.
🔴 <b>APEX `devexthub.com` БЕЗ www СЛОМАН (проверено 01.09.2026)</b> — прежняя запись «apex 443 отдаёт
GitHub Pages» НЕВЕРНА. Apex резолвится в 87.106.208.215 (IONOS), где 443 занят xray-VPN:
`https://devexthub.com` отдаёт сертификат <b>CN=www.icloud.com</b> (маскарад xray) → браузер показывает
ошибку сертификата, на сайт человек не попадает. `http://devexthub.com` → 301 на `https://devexthub.com:8443/`,
там служебный ответ «devexthub.com», тоже не сайт. Сайт живёт ТОЛЬКО на www (185.199.10x.153, Pages).
Наружу везде давать `https://www.devexthub.com/...` — в offpage-материалах ссылок без www 0 (сверено 01.09).
Содержит: витрину (homepage) + 4 продуктовых лендинга + блог.
4 продукта: PDF (pdf-to-excel), TVT (transcribe-video-to-text), ET (extract-text-from-image), IE (image-enhancer).
Позиционирование: «small, focused Chrome extensions — one thing well, free, no sign-up».

## На чём работает (статика/генератор, где хостинг — GitHub Pages, репо, домен+TLS)
- Чистая статика: HTML + styles.css, БЕЗ генератора. Файл `.nojekyll` (сборка Jekyll отключена).
- Хостинг: <b>GitHub Pages</b> (НЕ IONOS). Репо: github.com/Welders-don/devexthub-site, ветка <b>main</b> (04.08 сверено: origin default = main, master в репо нет; прежняя запись «master» была неверна).
- `CNAME` = www.devexthub.com. TLS выдаёт Pages. Живой с TLS с 25.07.2026.
- DNS: регистратор Dynadot (аккаунт Denis Toropov). apex → 87.106.208.215 (IONOS), www CNAME → welders-don.github.io.
- Грабля Dynadot: включён Account Lock — пока не снять, DNS не редактируется.

## Аналитика (Umami self-host: где дашборд, где креды, трекер)
- Umami self-host на IONOS: `/opt/umami`, docker.
- Дашборд: https://api.devexthub.com:8444 — за basic-auth.
  - Basic-auth креды: `/opt/umami/BASICAUTH_CREDS.txt`
  - Логин в сам Umami: `/opt/umami/ADMIN_CREDS.txt`
- 🟢 <b>Трекер (АКТУАЛЬНО с 01.09.2026): `https://api.devexthub.com:8443/u/script.js`</b>
  + `data-host-url="https://api.devexthub.com:8443/u"`,
  data-website-id `9cd8ea39-4803-4558-82cb-4821a96e581d`, data-domains www.devexthub.com,devexthub.com.
  Вшит в 38 HTML (коммит 6f5c359, на Pages раскатан и проверен живьём).
  <b>Старый адрес `:8444/script.js` НЕ РАБОТАЕТ у клиентов</b> — порт закрыт файрволом IONOS (ниже).
  Как устроено: `location /u/` в `sites-enabled/pdfex-api.conf` (вхост api.devexthub.com:8443)
  проксирует на `127.0.0.1:3000/`. Почему не отдельный вхост: на 8443 имя `api.devexthub.com`
  уже занято бэкендом PDF-to-Excel, второй такой же вхост nginx игнорирует
  (`conflicting server name ... ignored`) — проверено, так делать нельзя.
  Бэкап до правки: `/etc/nginx/pdfex-api.conf.bak-umami-1788242811`.
  Грабля при тестах: Umami отдаёт `{"beep":"boop"}` и НЕ пишет событие, если у запроса нет
  браузерного User-Agent — curl без `-H "User-Agent: Mozilla/..."` даёт ложный «не работает».
  ✅ <b>ПОДТВЕРЖДЕНО ЖИВЫМ ЗАХОДОМ 01.09 в 06:15:44 UTC</b> (14:15 по Китаю): визит Дениса с
  телефона записался — `url_path=/`, `hostname=www.devexthub.com`. Это ПЕРВОЕ за всю историю
  сайта событие от человека, а не от служебного запроса. Побочно: <b>8443 проходит из Китая</b>,
  тогда как 8444 оттуда таймаутил.
  ⚠️ Заходы самого Дениса теперь тоже пишутся и на малых числах искажают статистику —
  исключения по IP пока НЕТ (аналог DEV_IPS в Капитане не заводили, ждём запроса).
- Событие `store-click` (с 05.10): клик по любой ссылке в стор, свойство `ext` = продукт. Новая ссылка в стор = добавить `data-umami-event="store-click" data-umami-event-ext="<продукт>"`.
- АГЕНТУ UMAMI ДОСТУПНА, не разводить руками и не просить у Дениса ключи (facepalm 26.08):
  Umami слушает `127.0.0.1:3000` на том же IONOS, где сидит агент. Креды root-only →
  читать через ssh root@127.0.0.1 (пароль `$SERVER_IONOS_PASS`, pexpect, PubkeyAuthentication=no,
  команда в base64). Дальше POST `/api/auth/login` → token → GET `/api/websites/<id>/stats|metrics`.
  Сырьё быстрее из БД: `docker exec <db> psql -U umami -d umami`, таблица `website_event`.
- СОСТОЯНИЕ СБОРА на 26.08: движок ИСПРАВЕН (сквозной тест `/api/send` вернул sessionId,
  сертификат LE до 28.09, script.js 200, тег на лендингах на месте), но данных НЕТ —
  в `website_event` за всё время 2 записи, обе служебные (`/pdf-to-excel/` 25.07 при установке,
  `/probe-test` 10.08). Реальных визитов НОЛЬ. Сходится с GSC (3 клика / 4779 показов, последний
  клик 11.08) → это не поломка трекера, а отсутствие трафика. Прежде чем чинить аналитику,
  сверяться с GSC, а не бросаться отлаживать.
- 🔴 <b>ЗАМЕР 01.09.2026: ЖИВОЙ ВИЗИТ НЕ ЗАПИСАЛСЯ.</b> Денис открыл сайт с телефона 13:28 (скрин
  прислал) — в `website_event` НИ ОДНОЙ новой записи, там по-прежнему те же 2 служебные.
  Серверная часть при этом ЦЕЛА, проверено в тот же момент через ПУБЛИЧНЫЙ адрес (не 127.0.0.1):
  `https://api.devexthub.com:8444/script.js` → 200, 4655 байт, TLS валиден; OPTIONS-preflight с
  `Origin: https://devexthub.com` → 204 + `Access-Control-Allow-Origin: *`; POST `/api/send` → 200,
  вернул sessionId, запись легла в БД (пробник `/probe-0901-public` после проверки удалён, DELETE 1).
  Значит обрыв на КЛИЕНТСКОЙ стороне, между браузером и портом 8444.
- ✅ <b>НАСТОЯЩАЯ ПРИЧИНА (докопались 01.09): ОБЛАЧНЫЙ ФАЙРВОЛ IONOS, а НЕ Китай и НЕ оператор.</b>
  Порт 8444 закрыт для ВСЕГО интернета. Доказательства, три независимых:
  1. Скан с нейтрального внешнего хоста (AdminVPS, не Китай): <b>80 OPEN · 443 OPEN · 8443 OPEN ·
     8444 filtered · 8446 filtered · 9443 filtered</b>.
  2. На самом сервере фильтрации НЕТ: `ufw` inactive, `iptables INPUT` policy ACCEPT, пусто.
     Значит режет уровень провайдера (панель IONOS), изнутри его не видно.
  3. В nginx-логах за ВСЁ время `script.js` запрашивали <b>8 раз, все 8 с IP 87.106.208.215</b> —
     то есть с самого сервера, мои же curl. Ни одного внешнего обращения никогда.
  <b>Моя гипотеза «нестандартный порт режется у части сетей» была неверна по механизму</b> —
  порт не «у части», он закрыт у всех и всегда.
- 🟢 <b>ФИКС ЕСТЬ, ДЕШЁВЫЙ: перевесить Umami на 8443.</b> Порт 8443 открыт и рабочий — через него
  уже ходят живые пользователи расширений (`POST /ie/e` в логах, vhost `devexthub.com`,
  `sites-enabled/devexthub-main.conf`). Правка: в `sites-enabled/umami.conf` вхосту
  `server_name api.devexthub.com` ДОБАВИТЬ второй `listen 8443 ssl;` рядом с существующим
  `listen 8444 ssl;` (ничего не удалять, nginx разведёт по SNI — на 8443 уже сидят
  `devexthub.com` и `api.devnode24.ru`). Сертификат LE для api.devexthub.com уже есть.
  Затем в теге на 38 страницах заменить `:8444` → `:8443`.
- 🔴🔴 <b>Промежуточный (неверный) вывод 01.09: «порт 8444 не проходит до клиента».</b> Денис открыл
  `https://api.devexthub.com:8444/script.js` в браузере телефона → <b>ERR_CONNECTION_TIMED_OUT</b>
  (скрин 13:36, `.media/photo_1788241006753_0.jpg`). Не блокировщик — таймаут соединения.
  Трекер физически не загружается, поэтому событий и нет.
  <b>СЛЕДСТВИЕ: вся статистика «визитов ноль» НЕДЕЙСТВИТЕЛЬНА.</b> Umami была слепа с самого
  запуска (25.07). «В Umami ноль» НЕ значит «трафика ноль» — восстановить пропущенное нельзя.
  Единственный честный измеритель за весь период — GSC (только Google-поиск, 3 клика). Переходы
  с YouTube / Product Hunt / Custom GPTs / прямые заходы мы не мерили НИКОГДА.
  Прежний сквозной тест 26.08 шёл с самого сервера и клиентский путь не проверял — на этом
  и построилась ошибка «движок исправен, значит трафика нет».
- <b>Почему 443 недоступен (сверено 01.09 через `ss -tlnp`):</b> порт 443 держит xray (pid 1059),
  nginx (pid 1628619) слушает только 80 / 8443 / 8444 / 8446 / 9443. Вхост `api.devexthub.com`
  висит на 8444 и 8446 — оба нестандартные, оба под тем же риском. Занять 443 = трогать VPN Дениса.
  По 80 отдавать `script.js` нельзя: сайт на https, браузер зарубит mixed content.
- 🔒 <b>443 на IONOS ЗАНЯТ НАМЕРТВО, вариант «подвинуть xray» ЗАКРЫТ (сверено 01.09 по конфигу
  `/usr/local/x-ui/bin/config.json`):</b> инбаунд `vless` + <b>security=reality</b>, `dest: www.icloud.com:443`,
  `serverNames: ['www.icloud.com']`, `fallbacks: НЕТ`. REALITY не отдаёт свой сертификат и не умеет
  fallback по чужому SNI — добавить туда `api.devexthub.com` НЕЛЬЗЯ в принципе, а не «сложно».
  Отсюда же и сертификат www.icloud.com на apex. Освободить 443 = снести VPN Дениса. Не предлагать.
- ❌ <b>Railway как площадка для прокси НЕ существует</b> — у Дениса её нет, несмотря на живые
  `RAILWAY_TOKEN`/`RAILWAY_PROJECT_ID` в окружении (переменные от старых проектов). Не предлагать.

## Структура (витрина, лендинги, блог — сколько статей, SEO-каркас sitemap/robots)
- Витрина: `index.html` + `styles.css` (общий).
- 5 лендингов (каждый своя папка index.html): `pdf-to-excel/`, `transcribe-video-to-text/`, `extract-text-from-image/`, `image-enhancer/`, `convert-mov-to-mp4/` (с 23.09; продукт со 2-го dev-аккаунта, решение Дениса — всё под одним брендом devexthub).
- Блог: `blog/` + `blog/index.html`, ~25 статей-папок на диске (handoff фиксировал «18 статей», 28.07 добрали кластер PDF: pdf-to-csv, save-excel-as-pdf, pdf-to-excel-on-mac). Точное число к публикации — [проверить у Дениса].
- SEO-каркас (появился 28.07): `sitemap.xml` (32 URL, namespace ДОЛЖЕН быть http://www.sitemap<b>s</b>.org/... иначе GSC отбивает) + `robots.txt` (Allow /, ссылка на sitemap).
- На каждое расширение ~30 Semrush-ключей вшиты в описания/лендинги; FAQ-schema, UTM. GSC-verification meta в `index.html`. SEO-база закрыта с самого старта — новой задачей НЕ предлагать.
- 🔴 Полный список продуктов живёт в ДВУХ местах: главная `index.html` (меню, карточки, подвал, счётчик «N tools») и кабинет `app/index.html` (меню, подвал, блок `#xpromo` с 24.09, клики = Umami-событие `app-xpromo`). Лендинги и статьи соседей не перечисляют (только All tools + свой продукт), так задумано. Новый продукт = правка ОБОИХ файлов; 23.09 MOV забыли в кабинете, Денис поймал 24.09.
- UTM ссылок в стор на лендингах: `devexthub_landing`, а если referrer = `/app` (кабинет) → `devexthub_app` (26.09). Новый лендинг копировать с этой строкой, иначе переходы из кабинета пропадут в общем источнике.
- Медиа/баннеры: `assets/`, `.media/`, `releases/` (в т.ч. `releases/marquee/` — баннеры 1400x560 под CWS featured).

## Страница-инструмент «Bank statement to Excel» (10.10.2026)
- URL `/pdf-to-excel/bank-statement/`: конвертер выписки прямо на странице, PDF не уходит на сервер ($0). Скан/без таблицы → кнопка в стор (AI-режим расширения). UTM `devexthub_tool / bank-statement-tool`.
- Движок = КОПИЯ расширения Pdftoexel 1.1.1 + фикс кодов валют (Pdftoexel a63c9fa, 10.10, уйдёт в 1.1.2) в `assets/pdfx/` (pdf-to-tables, xlsx-writer, csv-writer, pdf.js, jszip) + свой `tool.js`. Правка парсера в расширении сама сюда НЕ приедет: переносить копией и гонять `node tools/e2e_bank_tool.mjs` (сайт на :8099).
- Umami-события: `bst-convert` (result ok/scan/empty/error/locked/not-pdf, pages), `bst-download` (fmt).
- Критерий: страница в индексе GSC к ~07.11. Не должно упасть: store-click pdf-to-excel с `/pdf-to-excel/`. Со статьи-эксперимента bank-statement ссылку НЕ ставили (замер 06.10).

## OCR-виджет на /extract-text-from-image/ (29.10.2026, курс Site Builders урок 1: «польза = виджет»)
- Блок `#try` сразу под hero вместо статичного макета `.ox-demo` (CSS `.ox-*` в styles.css остался, не используется). Картинка (файл / drop / Ctrl+V) → текст → Copy all / Download .txt; язык из списка 19, по умолчанию язык браузера, смена языка перечитывает ту же картинку.
- Движок = tesseract.js 7.0.0 с jsDelivr, НЕ PaddleOCR расширения (у того 27 МБ wasm + 13 МБ моделей). Первая загрузка ~7 МБ (core 3.9 + eng 2.95), дальше кэш IndexedDB. Прогрев: качать начинает по pointerdown/focus/dragenter на поле (пока человек выбирает файл), на LCP не влияет. 29.10 первый живой заход Дениса (Android, Яндекс, VPN): 51 с до результата → добавлен прогрев; эмуляция телефона 4x CPU / 10 Мбит: 13 с → 6 с. Картинка не покидает браузер.
- Перелив: после результата блок «draw a box on any tab» → стор, `utm_content=ocr-widget`, событие store-click с `place=ocr-widget`.
- Umami: `ocr-pick` (via file/drop/paste), `ocr-run` (result ok/empty/error/not-image, lang, secs = всё ожидание, load = из них ждали движок, read = распознавание; load/read с 29.10 вечера), `ocr-copy`, `ocr-download`. Тест: `node tools/e2e_ocr_tool.mjs` (сайт на :8099, нужна сеть).
- База до виджета (Umami, визиты страницы в неделю): 14.09-26.10 = 1/8/13/5/5/9/6; store-click extract-text с неё 5 за 05.10-28.10. Визиты Дениса не исключены.
- Критерий: `ocr-run ok` ≥ 20% визитов страницы за 2 недели после выкладки; store-click с этой страницы не ниже ~1/нед. Числа малые, вывод только по порядку.
- 29.10 on-page под ключи курса (knowledge/keywords-ocr-widget-2026-10-29.md): title «PNG to Text & JPG to Text Converter, Free OCR», H1 «PNG and JPG to text, free and online», sub про виджет + расширение для страниц, h2 виджета «Convert an image to text», FAQ «How do I convert a PNG or JPG to text?». Было: «Extract & Copy Text from Any Image, free OCR extension» / «Extract text from any image in one click». Критерий: в GSC за 4 недели появляются показы по png/jpg/picture to text; не падают store-click extract-text (~1/нед) и показы страницы (база 28 дн до 29.10 снять из GSC у Дениса).

## Виджет MOV ↔ MP4 на /convert-mov-to-mp4/ (29.10.2026, курс: польза = виджет)
- Блок `#try` под hero вместо картинки cvt-demo.jpg. ОДИН файл за раз (Денис 29.10: пачка = отличие расширения); две и больше → берём первый + подсказка про расширение (`mov-multi`).
- Движок = КОПИЯ расширения Convertmovtomp4 1.0.6 (ветка agent/unknown-codec) в `assets/mov/` (vendor: Mediabunny MPL-2.0 + @hevcjs MIT с лицензиями; app/convert.js без chrome.i18n, hevc-fallback.js) + свой `app/tool.js`. Правка движка в расширении сама сюда НЕ приедет.
- >150 МБ и есть showSaveFilePicker → пишем сразу на диск (жест истёк → кнопка «Choose where to save»). Без API (Safari/Firefox/мобилы) большие идут в память, OOM = понятная ошибка.
- Umami: `mov-pick` (path remux/transcode/transcode_sw/fallback/audio, kind, sizeMb), `mov-run` (result ok/warn/error, path, kind, sizeMb, secs, err), `mov-download-again`, `mov-multi`, store-click place=mov-widget.
- Тест: `node tools/e2e_mov_tool.mjs` (сайт :8095). На стенде HEVC прошёл transcode_sw за 16 с; ветка >150 МБ e2e НЕ покрыта; аппаратный транскод только живьём.
- База до виджета (визиты/нед): 28.09-19.10 = 4/2/5/4, store-click 2 за 4 нед.
- Критерий: `mov-run` ok+warn ≥ 20% визитов за 2 недели; store-click convert-mov со страницы не ниже ~2 за 4 нед. Числа малые.
- 30.10 первый экран под ключи курса (knowledge/keywords-mov-widget-2026-10-30.md): title «MOV to MP4 Converter Free Online, No Upload», H1 «Change MOV to MP4, free and online» (было «Convert MOV to MP4 in Your Browser» / «…right in your browser»). Критерий: показы в GSC по change a .mov to mp4 / mov to mp4 converter free за 4 нед.

## Виджет PDF → Excel на лендинге /pdf-to-excel/ (30.10.2026, ключ «convert pdf to excel» 18 100 / KD 23)
- Тот же `assets/pdfx/tool.js`, что у выписок, параметр `data-kind` на `.bst-tool`: `statement` (по умолчанию, выписки) / `table` (лендинг): тексты ошибок, имя листа Sheet1/Statement, события `pdfx-convert`/`pdfx-download` против `bst-*`. Блок `#try` в hero вместо макета `.px-demo` (CSS `.px-*` в styles.css остался).
- Первый экран: title «Convert PDF to Excel Free Online, No Upload», H1 «Convert PDF to Excel, free and online». Было «Convert PDF to Excel (and back), free Chrome extension» / «Stop retyping tables trapped in a PDF».
- Перелив: после результата блок про расширение (`utm_content=pdf-widget`, place=pdf-widget), на скане/пустом — AI-режим (`pdf-widget-scan`/`-empty`).
- e2e: `EV=pdfx BASE=…/pdf-to-excel/ node tools/e2e_bank_tool.mjs` (по умолчанию проверяет выписки); фикстура mac лежит в releases/blog-mac-shots/statement.pdf (не в git).
- База до виджета (визиты/нед /pdf-to-excel/): 21.09-26.10 = 5/10/3/4/4/7, store-click 10 за 3 нед.
- Критерий: `pdfx-convert` ok ≥ 20% визитов за 2 недели; store-click pdf-to-excel со страницы не ниже ~3/нед; через 4 нед в GSC показы по «convert pdf to excel».

## Виджет Image Enhancer на /image-enhancer/ (30.10.2026, ключи «enhanced the image» 22.2k/KD 15, «ai image upscale» 5.4k/KD 8)
- Блок `#try` под hero вместо CSS-демо `.ie-demo` (стили `.ie-*` в styles.css остались). Режимы как в расширении: Enhance (по умолчанию) / Upscale 2x / 4x / Unblur, сила 2 (Средний). Вход ≤ 4 МП. Шторка до/после (окно по пропорциям, max 60vh), Download PNG, «Try 2x/4x/Unblur» на той же картинке.
- Движок `assets/ie/engine.js` = копия offscreen.js расширения 1.1.3 (тайлы 512 GPU / 256 WASM, overlap 16, самопроверка WebGPU → WASM, сила через смешивание), без chrome.*; ORT 1.26.0 ort.webgpu.min.mjs с jsDelivr, модель с IONOS `devexthub.com:8443/ie-assets/` (CORS *), кэш Cache API `ie-site-model-v1`. Работает в Web Worker (`worker.js`): на WASM тайл считается секундами, в главном потоке страница замирала. Отмена = terminate воркера + новый (мгновенно, модель из кэша).
- WASM без crossOriginIsolated = ОДИН поток (Pages не ставит COOP/COEP). Замер на IONOS (2 ядра, без GPU): 0.75 МП enhance = 230 с. Поэтому на пути WASM показываем остаток времени и пометку «нет ускорения видеокарты, расширение быстрее (несколько ядер)». С WebGPU секунды.
- Первая загрузка ~10 МБ (ORT jsep wasm br 5 МБ + модель 4.87 МБ); прогрев по pointerdown/focus/dragenter.
- Umami: `ie-pick`, `ie-run` (result ok/cancel/error/too_large/not-image/bad-image, mode, mp, secs, load, backend), `ie-rerun`, `ie-download`; store-click place=ie-widget. e2e `tools/e2e_ie_tool.mjs` (сайт :8091).
- Первый экран: title «Free AI Image Enhancer & Upscaler, Online or Chrome Extension» (оставлено «Chrome Extension»: по запросу «image enhancer chrome extension» страница была на поз. 7-8), H1 «Enhance and upscale images, free and online».
- База (визиты/нед): 28.09-26.10 = 9/7/5/5/3, store-click 7 за 4 нед.
- Критерий: `ie-run` ok ≥ 20% визитов за 2 нед; store-click image-enhancer со страницы не ниже ~2/нед; доля backend=wasm и cancel на wasm смотреть отдельно (если wasm-юзеры массово отменяют → урезать вход на wasm до 1 МП).

## Страница MKV → MP4 /mkv-to-mp4/ (30.10.2026, кластер MKV ~50k: mkv to mp4 22.2k/KD 27, .mkv to mp4 3.6k/KD 18)
- Тот же виджет и движок, что у MOV (`assets/mov/app/tool.js` + `convert.js`), режим `data-kind="mkv"` на `.mvt-tool`: перед конвертацией шаг «Choose the sound» (свой UI по курсу), если дорожек > 1 или звук не AAC/MP3/Opus. `listAudioTracks()` + `audioPick` (track.number, остальные discard), галка «в AAC» активна, только если браузер декодирует дорожку (AC-3/DTS Chrome обычно нет → копия + предупреждение). Субтитры MKV не переносятся (честно в FAQ).
- События `mkv-options` (tracks, codecs), `mkv-pick`, `mkv-run`, `mkv-multi`, `mkv-download-again`; store-click place=mkv-widget (расширение то же, convert-mov; MKV оно тоже конвертирует). Ссылка на страницу с MOV-страницы, в sitemap.
- e2e `tools/e2e_mkv_tool.mjs` (ffmpeg делает dual/aac/ac3 MKV), регрессия MOV `tools/e2e_mov_tool.mjs`.
- Критерий: страница в индексе GSC к ~20.11; `mkv-run` ok+warn ≥ 20% визитов после индексации.

## Страница видео → GIF /video-to-gif/ (30.10.2026, mp4 to gif converter 6.6k/KD 7, how to turn video into gif 2.9k/KD 8)
- `assets/gif/tool.js`: кадры Mediabunny CanvasSink (`assets/mov/vendor`, тот же модуль, HEVC без железа = `assets/mov/app/hevc-fallback.js`), GIF = gifenc 1.0.3 (MIT, `assets/gif/gifenc.esm.js` + LICENSE). Свой UI: начало, длина ≤ 15 с, ширина 320/480/640, 10/15 fps, превью первого кадра, GIF на странице до скачивания. В главном потоке (кадр 480 px ≈ десятки мс).
- Замер стенда: 10 с 720p H.264 → 5 с GIF 480 px 10 fps = 50 кадров, 591 КБ, 3 с; айфонный HEVC MOV программно 2 с / 320 px — ок.
- События `gif-pick` (secs), `gif-run` (result ok/cancel/error, frames, fps, width, sizeKb, secs, why), `gif-download`. Store-CTA в виджете нет (расширение GIF не делает), ссылки на MOV/MKV-страницы. e2e `tools/e2e_gif_tool.mjs`.
- Критерий: в индексе GSC к ~20.11; `gif-run` ok ≥ 20% визитов после индексации.

## Страница PDF → TXT /pdf-to-text/ (30.10.2026, кластер ~19k: pdf to txt 4.4k/KD 30, pdf to txt file 2.9k, how to copy text from pdf 1.9k)
- `assets/pdfx/text.js` на том же pdf.js: элементы страницы группируются в строки по высоте, слева направо (две колонки на одной высоте сливаются в одну строку, как у pdftotext без -layout). Скан (текста < 20 символов) → совет: скриншот страницы в наш OCR /extract-text-from-image/. Таблицы → ссылка на /pdf-to-excel/; с лендинга PDF→Excel обратная ссылка (не классом bst-again: на нём висит открытие выбора файла).
- События `ptx-convert` (result ok/scan/error/locked/not-pdf, pages, secs), `ptx-copy`, `ptx-download`. e2e `tools/e2e_pdftxt_tool.mjs`.
- Критерий: в индексе GSC к ~20.11; `ptx-convert` ok ≥ 20% визитов после индексации.

## Страница QR с картинки /scan-qr-code-from-image/ (30.10.2026, scan qr codes from picture 3.6k/KD 30, кластер ~4.3k)
- `assets/qr/tool.js` + jsQR 1.4.0 (Apache-2.0, `assets/qr/jsQR.min.js` + LICENSE), грузится при первой картинке; пробует масштабы 1200/2400/800/600 и инверсию. Ссылка из QR показывается с доменом (защита от подделок), открывается с noopener/nofollow. Расширения под QR нет → на странице нет store-CTA; ссылки на OCR и обратно (с /extract-text-from-image/).
- События `qr-scan` (result ok/none/error/not-image, kind url/wifi/text), `qr-copy`, `qr-open`. e2e `tools/e2e_qr_tool.mjs` (QR рисует qrcode-generator с jsDelivr: чистый, мелкий в скриншоте, инверсный, повёрнутый+размытый).
- Грабля: `.btn` перебивает `hidden` → `#qr-open[hidden] { display: none }`.

## Страница картинка → Word /image-to-word/ (30.10.2026, кластер ~3.8k: image to word converter 1.6k/KD 30, png to word 880/KD 17)
- Тот же OCR-виджет (`assets/ocr/tool.js`, tesseract.js) + главная кнопка «Download Word (.docx)» (`#oxt-docx`, есть только на этой странице) → `assets/ocr/docx.js`: минимальный .docx через JSZip (`/assets/pdfx/jszip.min.js`), строка = абзац. Проверено python-docx (открывается, абзацы верные). Событие `ocr-download` теперь с `fmt` (txt/docx) на обеих страницах.
- e2e `tools/e2e_word_tool.mjs`, регрессия OCR `tools/e2e_ocr_tool.mjs`. Ссылки OCR ↔ Word.

## Страница изменить размер картинки /resize-image/ (30.10.2026, кластер ~27.7k: change size of image 14.8k/KD 24, shrink image size 1.6k/KD 13)
- `assets/resize/tool.js`: canvas, без сети. Ширина/высота с замком пропорций, проценты, JPG/PNG/WEBP, качество (у PNG скрыто), живой вес файла, превью. JPG заливает прозрачность белым. Ссылки ↔ /image-enhancer/ («больше и чётче = AI»).
- События `rsz-pick` (mp), `rsz-run` (not-image/bad-image), `rsz-download` (format, w, h). e2e `tools/e2e_resize_tool.mjs`.

## Страница видео → звук /mov-to-mp3/ (30.10.2026, кластер ~41k: mov to mp3 18.1k/KD 29, convert mov to mp3 8.1k/KD 28, mov to wav 2.4k/KD 15)
- `assets/audio/tool.js`: Mediabunny Conversion (видео discard), выход MP3 (LAME 3.100 wasm = `assets/mov/vendor/mediabunny-mp3-encoder.min.mjs`, @mediabunny/mp3-encoder 1.56.2 MPL, импорт переписан на `./mediabunny.min.mjs`), WAV (pcm-s16), M4A (AAC только если `canEncodeAudio`, на Linux-Chrome выключен с подписью). Качество 128/192/320, 5.1 сводится в стерео, оценка размера до старта, WAV > 1.5 ГБ блокируется. Плеер результата на странице.
- 🔴 LAME = LGPL: под виджетом строка «made with LAME (LGPL, license and source)» → `assets/mov/vendor/mp3-encoder-LICENSE.txt` (ссылки на исходники LAME и сборку). Не убирать; кодер держать отдельным файлом.
- События `mp3-pick` (codec, mins, sizeMb), `mp3-run` (result ok/error, path mp3/wav/m4a или noaudio/nodecode/rejected, kbps, codec, secs), `mp3-download-again`. e2e `tools/e2e_mp3_tool.mjs` (MOV→MP3 320 / WAV, MKV 5.1 Opus → стерео, без звука, txt, отмена, мобильный). Ссылки с MOV- и GIF-страниц.
- Критерий: в индексе GSC к ~20.11; `mp3-run` ok ≥ 20% визитов после индексации. Не должно упасть: `mov-run` на /convert-mov-to-mp4/.

## Страница перевод с картинки /translate-picture/ (30.10.2026, кластер ~19k: translate from a pic 9.9k/KD 28, translate photo to english 8.1k/KD 28)
- OCR-виджет тот же (`assets/ocr/tool.js`, после распознавания шлёт событие `oxt-text` {text, lang}), перевод = `assets/translate/tool.js`: строки склеиваются в абзацы, перевод по абзацам. Цель по умолчанию English (картинка английская → язык браузера или Spanish).
- Движок 1: Chrome Translator API (Chrome 138+/Edge 148+, только десктоп, на устройстве, $0, без лимита). Скачать языковой пакет можно только по клику → кнопки «Download and translate on this computer» / «Translate online instead». 🔴 `availability()` может не ответить вовсе (headless Chrome 145 висит) → таймаут 4 с = API нет. В воркере API не работает.
- Движок 2 (нет API / unavailable): MyMemory `api.mymemory.translated.net/get` без ключа, CORS *, ≤ 500 байт за запрос (режем по предложениям), ~5000 символов/день на IP; лимит = `quotaFinished`/«MYMEMORY WARNING» → честный текст. Уходит только текст, картинка нет (написано под виджетом и в FAQ).
- События `trn-run` (result ok/quota/error/ask-download, engine device|mymemory, src, tgt, chars, secs), `trn-copy`; OCR-события как на /extract-text-from-image/. e2e `tools/e2e_translate_tool.mjs` (Translator подменяется, MyMemory в кейсе 1 настоящий).
- Критерий: в индексе GSC к ~20.11; `trn-run` ok ≥ 20% визитов после индексации; доля quota < 10% от trn-run. Не должно упасть: `ocr-run` ok на /extract-text-from-image/.

## Страница PDF → CSV /pdf-to-csv/ (30.10.2026, кластер ~5.9k: pdf to csv 4.4k/KD 24, pdf to csv converter free 320/KD 28)
- Тот же `assets/pdfx/tool.js`, `data-kind="csv"` (события `pcsv-convert`, `pcsv-download` {fmt, sep comma/semicolon/tab}). Отличие от /pdf-to-excel/: CSV главная кнопка + выбор разделителя (`;` для Excel в Европе/Латинской Америке, где CSV через запятую открывается одной колонкой). `csv-writer.js` получил параметр `sep` (по умолчанию ',', в расширении такого нет — копия разошлась). Нужен `<script src="/assets/pdfx/jszip.min.js">` (без него виснет на «Reading»).
- Статью /blog/how-to-convert-pdf-to-csv/ (выжившая после склейки 20.09) НЕ трогали; ссылку из неё на инструмент — после 03.11 и по слову Дениса. Ссылка на страницу: с /pdf-to-excel/ (экран готово) + sitemap.
- e2e `tools/e2e_csv_tool.mjs` (выписка-фикстура Pdftoexel: запятая/;/таб, xlsx, события, UTM, не-PDF, мобильный). Регресс: `tools/e2e_bank_tool.mjs` (bst и EV=pdfx; фикстура releases/blog-mac-shots/statement.pdf есть только в основной папке).
- Критерий: в индексе GSC к ~20.11; `pcsv-convert` ok ≥ 20% визитов после индексации. Не должно упасть: `pdfx-convert` на /pdf-to-excel/.

## ⏸ СПРЯТАНЫ 30.10 (Денис: языки делать пачкой и с ключами Semrush на каждый язык): noindex, вне sitemap, hreflang снят с обеих сторон; файлы и RU-словари в tool.js оставлены. Вернуть = откатить коммит «ru-off».
## Русские страницы /ru/tekst-iz-foto/ и /ru/perevod-s-kartinki/ (30.10.2026, кластеры OCR рус. 5.8k: текст из фото 1300/KD 29, текст по фото 1300/25; перевод рус. 2.45k: перевод с картинки 720/30)
- Первые не-английские страницы сайта. Движки общие: `assets/ocr/tool.js` и `assets/translate/tool.js` берут тексты интерфейса по `<html lang>` (ru → словарь T). `data-fixed` на `#oxt-lang` = язык распознавания задан страницей, язык браузера его не перебивает (текст из фото: rus; перевод: eng → ru).
- hreflang ru/en/x-default в обе стороны с /extract-text-from-image/ и /translate-picture/. Шапка/подвал русские, без ссылок в стор в шапке; в виджете «текст из фото» блок расширения по-русски (utm_content ocr-widget-ru, utm_campaign ru-tekst-iz-foto).
- События те же (ocr-run, trn-run), русские отличаются url_path /ru/. e2e `tools/e2e_ru_tool.mjs` (SITE=…; браузер en-US; MyMemory настоящий). Регресс английских: e2e_translate/ocr/word.
- Критерий: обе в индексе GSC к ~20.11 (Яндекс не подключён — решение Дениса, если пойдёт). Не должно упасть: ocr-run/trn-run на английских страницах.

## Где деплой / грабли (git push на Pages, почему НЕ IONOS, CNAME)
- Деплой = `git push origin main` → GitHub Pages пересобирает автоматически (~1-2 мин). Отдельного билд-шага нет.
- Почему НЕ IONOS: на IONOS-боксе порт 443 занят VPN (xray). nginx туда лендинги не отдаст → сайт вынесен на Pages.
- CNAME-файл трогать осторожно: его перезапись ломает привязку www→Pages.
- Домен devexthub.com — НЕ путать с чужим devxhub.com (на Cloudflare).
- ГРАБЛЯ токена: в `git remote` этого репо вшит GitHub-токен в открытом виде — при работе с remote не светить в чат, предложить Денису ротацию (в fine-grained token / env).
- <b>«Закоммитил» здесь = «опубликовал».</b> Репо раздаётся как сайт: любой файл доступен по URL
  (проверено — `/releases/video-samples/et-how-to-long-v2.mp4` отдаёт 200 кому угодно). Видео-сырьё,
  записи экрана и промежуточные рендеры в репо НЕ кладём: на исходниках личные данные (имя в окне,
  русская лента, таскбар — из финалов это срезается кропом, из сырья нет). Прикрыто .gitignore
  (`releases/**/*.{mp4,wav,pcm,mp3}`, `src/`, `frames/*.png`, `*_resp.json`). Готовые ролики живут
  на YouTube. Перед каждым push смотреть `git diff origin/main..main --stat`: 25.08 в main тихо
  накопилось 20 коммитов / 179 файлов / 74 МБ с необрезанной записью экрана Дениса.

## UI / дизайн (анимации, иконки, бренд-знак)
- <b>Hero-анимации</b> (в `styles.css`, live с 07.08): пословный ревил H1 на входе (маска `.fx-line` + `.fx-w`, одноразовый) + sheen по `.hero .btn-lg` (цикл). Обёрнуто в `@media (prefers-reduced-motion: no-preference)` — БЕЗ анимаций текст H1 виден (SEO/a11y). H1 на всех 5 страницах размечены по словам (span.fx-w с `--i`). Прототип: `_preview/hero-fx.html`.
- <b>Иконки продуктов в карточках</b> главной (live с 07.08): в блоке `.tools` вместо текстовых плашек — реальные store-иконки `assets/{pdf-to-excel,transcribe,extract-text,image-enhancer}-icon-128.png` (сверены с CWS). Класс `.tool img.mark`. НЕ заменять на текст обратно.
- <b>Головной бренд-знак Devexthub — ВЫБРАН И ЖИВЁТ (27.08, вариант B «Y», 3 узла).</b> Денис выбрал B из пачки `_preview/logo-hub-v2.*` (не E, как я рекомендовал). Файлы: `assets/logo-mark.svg` (основной, stroke 6) + `assets/logo-mark-small.svg` (утолщённый, только под 16px) + PNG 16/32/48/128/180. Пересборка — `node spike/render-logo.mjs`. В шапке подставлен через `background` у `.dot` в `styles.css:50` — ОДНА правка CSS покрывает все 38 страниц, HTML-разметку `<span class="dot">` не трогали. Размер бренда в шапке: **знак 26px / текст 20px** (`styles.css:49-50`) — подняли на +15% от исходных 22/18 по решению Дениса 27.08, живьём проверено. Вариант +35% (30/24) отвергнут: бренд начинает давить навигацию, оставшуюся на 15px. Фавикон (svg + png32 + apple-touch 180) врезан в `<head>` всех 38 страниц после `<meta charset>`, пути абсолютные `/assets/...`. Грабля размеров: утолщённая версия на 32px и выше даёт слипшуюся «кляксу» (узлы сливаются с центром) — выше 16px использовать ТОЛЬКО тонкую.
- Рендер иконок/превью: `chrome-headless-shell` из playwright (полный chrome в песочнице падает) — см. `~/workspace/knowledge/headless-screenshot.md`.

## Продвижение / рост (план)
Цель — трафик и вес домена на все 4 продукта. Три канала:
1. Off-page бэклинки: залистились по каталогам-площадкам за ссылками. Учёт — `offpage/BACKLINKS-LEDGER.md` (статусы по 4 продуктам, вести после каждого захода). Submit жмёт Денис с чистого IP (директории режут датацентр-IP), агент готовит пакеты текстов.
2. YouTube-видео: how-to ролики под продукты, заворачиваем свой трафик. Драфты — `offpage/youtube-videos-pdf-drafts.md`, стратегия разгона — `~/workspace/knowledge/youtube-channel-warmup.md`.
3. Custom GPTs (агенты в ChatGPT/Gemini): тематические GPT-помощники со ссылкой на лендинг в Instructions. ✅ РАЗВЁРНУТО 01.08 — 18 public-ботов live (PDF 5, TVT 5, ET 4, IE 4). Драфты `offpage/custom-gpts-*-drafts.md`, статус/грабли в BACKLINKS-LEDGER.md. Ценность = referral-трафик + индексируемые страницы GPT Store, НЕ бэклинк-вес (домен в профиле nofollow). Грабля: чужой бренд в НАЗВАНИИ бота = блок публикации, домен-верификация не спасает → имена нейтральные, бренды только внутри Instructions.
Статус по каждому каналу — оперативно в `_handoff.md`, не здесь.

## Ключевое (важные файлы: BACKLINKS-LEDGER, реестры / реперы)
- `offpage/BACKLINKS-LEDGER.md` — ГЛАВНЫЙ реестр off-page: где какой из 4 продуктов залит, статусы ✅🟡📝⬜⏳🚫. Вести ПОСЛЕ КАЖДОГО захода.
- `offpage/cws-canonical-urls.md` — канонические CWS-URL всех 4 расширений (со slug, для каталогов).
- `offpage/*-submission-texts.md`, `offpage/free-directories-pack.md`, `offpage/transcribe-directories.md` — готовые пакеты текстов по площадкам.
- `offpage/custom-gpts-pdf-drafts.md`, `offpage/youtube-videos-pdf-drafts.md` — драфты доп. каналов.
- `knowledge/seo-keywords-*.md` — Semrush-ключи по продуктам; `knowledge/extension-growth-research-2026-07.md` — ресёрч роста.
- Off-page правило: директории (AlternativeTo, SaaSHub, Toolify…) режут датацентр-IP (Cloudflare) — Submit жмёт САМ Денис с чистого IP + капча глазами, агент готовит только пакеты текстов.
- `_handoff.md` — оперативный контекст/статусы (индексация GSC, featured-бейдж и т.п.).

## Перенесено из MEMORY.md (19.09.2026)
- Правило по портам: облачный файрвол IONOS открыт на 80/443/8443 и режет 8444/8446/9443 — любые НОВЫЕ сервисы вешать на 8443.
- Новый продукт на сайте: полный перечень продуктов есть ТОЛЬКО в index.html и app/index.html (кабинет саммари, самая большая воронка). 23.09 MOV добавили на главную и забыли /app/ (фикс 1076b73). Проверка: grep -l 'Image Enhancer</a>' по всем html. Лендинги/статьи соседей не перечисляют намеренно.
