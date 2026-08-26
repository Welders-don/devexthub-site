# Devexthub-site — карта проекта (реперные точки)
> Стабильная шапка. Читать ПЕРВОЙ при вопросе по проекту. Детали — в _handoff.md/knowledge/.

## Что это (назначение: сайт-хаб, домен, что содержит)
Статический маркетинговый сайт-хаб для линейки Chrome-расширений Devexthub.
Домен: <b>www.devexthub.com</b> (apex 443 отдаёт GitHub Pages).
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
- НЕ ПРОВЕРЕНО (гипотеза, не выдавать за факт): порт 8444 нестандартный, часть корпоративных
  сетей и мобильных операторов пропускает только 443 → доля заходов может теряться молча.
  Проверяемо только на живом трафике.

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
- <b>Головной бренд-знак Devexthub — В СТАДИИ ВЫБОРА (не финализирован).</b> Сейчас в углу к «Devexthub» стоит простая зелёная точка `.dot`. Набросаны концепты (`_preview/logo-concepts.*`, `_preview/logo-hub-v2.*`): выбран курс на «хаб-узел», 5 форм (A «+» / B «Y» / C гекс / D орбита / E «+» с кольцом), рекомендация — E. Денис думает. Когда выберет: собрать SVG+PNG 128/48/32/16, поставить фавикон + в угол вместо `.dot`. Эмблемы пока нет, генерить с нуля.
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
