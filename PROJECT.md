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
- Трекер вшит в лендинги: `https://api.devexthub.com:8444/script.js`,
  data-website-id `9cd8ea39-4803-4558-82cb-4821a96e581d`, data-domains www.devexthub.com,devexthub.com.
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
- 4 лендинга (каждый своя папка index.html): `pdf-to-excel/`, `transcribe-video-to-text/`, `extract-text-from-image/`, `image-enhancer/`.
- Блог: `blog/` + `blog/index.html`, ~25 статей-папок на диске (handoff фиксировал «18 статей», 28.07 добрали кластер PDF: pdf-to-csv, save-excel-as-pdf, pdf-to-excel-on-mac). Точное число к публикации — [проверить у Дениса].
- SEO-каркас (появился 28.07): `sitemap.xml` (32 URL, namespace ДОЛЖЕН быть http://www.sitemap<b>s</b>.org/... иначе GSC отбивает) + `robots.txt` (Allow /, ссылка на sitemap).
- На каждое расширение ~30 Semrush-ключей вшиты в описания/лендинги; FAQ-schema, UTM. GSC-verification meta в `index.html`. SEO-база закрыта с самого старта — новой задачей НЕ предлагать.
- Медиа/баннеры: `assets/`, `.media/`, `releases/` (в т.ч. `releases/marquee/` — баннеры 1400x560 под CWS featured).

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
