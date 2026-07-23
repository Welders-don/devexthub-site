# Handoff — Devexthub site (сайт-хаб линейки расширений)

## Где остановились (2026-07-23)
Собран и опубликован статический сайт-хаб под всю линейку CWS-расширений.
Живёт на GitHub Pages (НЕ на IONOS: там 443 занят VPN xray, браузерные страницы
застряли бы на :8443, публичный URL с портом не годится).

## Что сделано
- Репо: https://github.com/Welders-don/devexthub-site (публичный, только статика)
- Живой URL: https://welders-don.github.io/devexthub-site/
- Страницы:
  - `/` — витрина линейки (PDF-to-Excel живой + Extract Text / Transcribe / Image Enhancer как "coming")
  - `/pdf-to-excel/` — полноценный лендинг (hero, демо до/после, how it works, why, 2 CTA в стор, privacy)
- Бренд зелёный под скрин PDF-to-Excel, адаптив, SEO-мета + og.
- Все тире «—» вычищены (правило feedback_no_em_dash).
- Демо-картинка = releases/promo-v2/s1-beforeafter.png проекта Pdftoexel.

## Следующий шаг (за Денисом, не срочно)
1. DNS: там где управляется devexthub.com — добавить запись
   `www` CNAME → `welders-don.github.io` (значение домена лежит в файле CNAME.later).
2. Вернуть кастомный домен в Pages: после того как DNS распространится (10 мин – пара часов),
   в репо Settings → Pages → Custom domain вписать `www.devexthub.com` (или вернуть файл CNAME
   `mv CNAME.later CNAME && git commit && push`). GitHub сам выдаст HTTPS.
3. CWS дашборд: item "Convert PDF to Excel" → Store listing → поле Website →
   вписать `https://www.devexthub.com/pdf-to-excel/` (сейчас там голый api.devexthub.com — слитый DR92-бэклинк).

## Как добавлять новый лендинг в линейку
- Скопировать папку `pdf-to-excel/`, поменять тексты + ссылку в стор + картинку в assets/.
- Раскомментировать/поправить карточку в корневом index.html (убрать class `soon`, дать href).
- git commit + push → Pages пересобирается сам за ~1 мин.
- Позже: блог-статьи под ключи (`/blog/...`) → тянут органику из Google → воронка в стор.

## Контекст
- git identity репо: agent@devexthub.com. Пуш: inline token `https://x-access-token:$GITHUB_TOKEN@github.com/...`
- Pages API: POST/PUT /repos/Welders-don/devexthub-site/pages, ребилд POST .../pages/builds
- Демо-скрин рендерил headless chrome-shell (chromium_headless_shell-1208).
- Директорий-пак для сабмитов: projects/Pdftoexel/releases/promo-v2/directory-submission-pack.md
