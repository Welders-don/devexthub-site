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
- Хостинг: <b>GitHub Pages</b> (НЕ IONOS). Репо: github.com/Welders-don/devexthub-site, ветка master.
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

## Структура (витрина, лендинги, блог — сколько статей, SEO-каркас sitemap/robots)
- Витрина: `index.html` + `styles.css` (общий).
- 4 лендинга (каждый своя папка index.html): `pdf-to-excel/`, `transcribe-video-to-text/`, `extract-text-from-image/`, `image-enhancer/`.
- Блог: `blog/` + `blog/index.html`, ~25 статей-папок на диске (handoff фиксировал «18 статей», 28.07 добрали кластер PDF: pdf-to-csv, save-excel-as-pdf, pdf-to-excel-on-mac). Точное число к публикации — [проверить у Дениса].
- SEO-каркас (появился 28.07): `sitemap.xml` (32 URL, namespace ДОЛЖЕН быть http://www.sitemap<b>s</b>.org/... иначе GSC отбивает) + `robots.txt` (Allow /, ссылка на sitemap).
- На каждое расширение ~30 Semrush-ключей вшиты в описания/лендинги; FAQ-schema, UTM. GSC-verification meta в `index.html`. SEO-база закрыта с самого старта — новой задачей НЕ предлагать.
- Медиа/баннеры: `assets/`, `.media/`, `releases/` (в т.ч. `releases/marquee/` — баннеры 1400x560 под CWS featured).

## Где деплой / грабли (git push на Pages, почему НЕ IONOS, CNAME)
- Деплой = `git push origin master` → GitHub Pages пересобирает автоматически. Отдельного билд-шага нет.
- Почему НЕ IONOS: на IONOS-боксе порт 443 занят VPN (xray). nginx туда лендинги не отдаст → сайт вынесен на Pages.
- CNAME-файл трогать осторожно: его перезапись ломает привязку www→Pages.
- Домен devexthub.com — НЕ путать с чужим devxhub.com (на Cloudflare).
- ГРАБЛЯ токена: в `git remote` этого репо вшит GitHub-токен в открытом виде — при работе с remote не светить в чат, предложить Денису ротацию (в fine-grained token / env).

## Ключевое (важные файлы: BACKLINKS-LEDGER, реестры / реперы)
- `offpage/BACKLINKS-LEDGER.md` — ГЛАВНЫЙ реестр off-page: где какой из 4 продуктов залит, статусы ✅🟡📝⬜⏳🚫. Вести ПОСЛЕ КАЖДОГО захода.
- `offpage/cws-canonical-urls.md` — канонические CWS-URL всех 4 расширений (со slug, для каталогов).
- `offpage/*-submission-texts.md`, `offpage/free-directories-pack.md`, `offpage/transcribe-directories.md` — готовые пакеты текстов по площадкам.
- `offpage/custom-gpts-pdf-drafts.md`, `offpage/youtube-videos-pdf-drafts.md` — драфты доп. каналов.
- `knowledge/seo-keywords-*.md` — Semrush-ключи по продуктам; `knowledge/extension-growth-research-2026-07.md` — ресёрч роста.
- Off-page правило: директории (AlternativeTo, SaaSHub, Toolify…) режут датацентр-IP (Cloudflare) — Submit жмёт САМ Денис с чистого IP + капча глазами, агент готовит только пакеты текстов.
- `_handoff.md` — оперативный контекст/статусы (индексация GSC, featured-бейдж и т.п.).
