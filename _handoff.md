# Handoff — Devexthub site (сайт-хаб линейки расширений)

## Где остановились (2026-07-25)
Лендинг PDF-to-Excel полностью переделан + заточен под SEO-ключи. Денис ТОЛЬКО ЧТО добавил
DNS-запись www в Dynadot. Ждём пропагацию, дальше подключить к GitHub Pages и вписать в CWS.

## Что сделано в эту сессию (2026-07-25)
1. РЕСЁРЧ конверсионных лендингов молодых расширений (агент). Выжимка в knowledge проекта нет
   отдельного файла — принципы применены прямо в лендинг: demo-GIF/картинка, 1 primary-CTA
   повторённый, липкая кнопка, trust-строка, приватность как соц-пруф, FAQ, mobile-first, scroll-анимации.
2. РЕДИЗАЙН pdf-to-excel/index.html: sticky-шапка + всплывающая круглая кнопка, hero с 1 CTA +
   микро-строка, trust-полоса, блок «проблема→решение», нумерованные шаги, 4 фиче-карты (вкл.
   «Works both ways»), блок приватности с галочками, FAQ (7 вопросов), UTM на все store-ссылки
   (utm_source=devexthub_landing → видно в CWS-дашборде источники установок).
   CSS-дополнения в styles.css (sticky, sticky-cta, trust, step-num, ticks, faq, reveal).
3. SEO-ресёрч Semrush (US) — карта ключей в knowledge/seo-keywords-pdf-to-excel.md:
   - Достижимая зона KD<50: pdf→excel 42.8K + excel→pdf 44.7K показов/мес. Головные (KD 88) не берём.
   - Ключи кластеризуются — 1 pillar-статья ловит весь кластер.
   - РЕШЕНО: расширение умеет PDF↔Excel + CSV. НЕ Word, НЕ Google Sheets (не обещать).
   - Лендинг заточен под core tool-ключи: extract table from pdf to excel, copy/export table, Excel or CSV,
     excel→pdf сторона выведена наравне (title/hero/фичи/FAQ/alt).
4. ПАМЯТЬ: регистратор/DNS домена = Dynadot (аккаунт DENIS TOROPOV). Записано в workspace/MEMORY.md.

## DNS-статус — ГОТОВО (25.07)
- Домен devexthub.com на Dynadot. Зарегистрирован 30.06.2026, продление 30.06.2027 (~$8.99/год).
- apex devexthub.com → A 87.106.208.215 (IONOS, там API/VPN — НЕ трогать).
- Поддомены api, transcribe → A 87.106.208.215 (рабочие, не трогать).
- www → CNAME → welders-don.github.io — ПРОПАГИРОВАЛСЯ.
- CNAME-файл в репо (коммит 2ecc2ef), Pages принял домен, TLS approved (до 23.10.2026), Enforce HTTPS = ON.
- https://www.devexthub.com/pdf-to-excel/ отдаёт 200 + валидный HTTPS. Работает.

## Следующий шаг (продолжить с этого)
1. Проверить пропагацию: `dig +short CNAME www.devexthub.com @8.8.8.8` → должно отдать welders-don.github.io.
2. Когда резолвится — подключить кастомный домен к GitHub Pages:
   - вернуть файл CNAME: `mv CNAME.later CNAME` (в нём www.devexthub.com), git commit + push;
   - ИЛИ через Pages API: PUT /repos/Welders-don/devexthub-site/pages c cname=www.devexthub.com.
   - GitHub сам выпустит HTTPS (Enforce HTTPS) — подождать до часа.
3. Проверить https://www.devexthub.com/pdf-to-excel/ открывается с валидным TLS.
4. CWS дашборд «Convert PDF to Excel» → Store listing → поле Website →
   `https://www.devexthub.com/pdf-to-excel/` (сейчас там голый api.devexthub.com — слитый DR92-бэклинк). За Денисом.
5. ЭТАП 3 — ГОТОВО (25.07): Umami self-host на IONOS поднят и подключён к лендингам.
   - Docker-стек /opt/umami (umami@3.2.0 + postgres:16 контейнер), слушает 127.0.0.1:3000.
   - nginx /etc/nginx/sites-enabled/umami.conf: TLS-порт 8444, server_name api.devexthub.com
     (переиспользован серт api.devexthub.com; 443 занят xray-VPN — не трогать).
   - Дашборд: https://api.devexthub.com:8444  (логин admin, пароль в /opt/umami/ADMIN_CREDS.txt root:600).
   - website_id = 9cd8ea39-4803-4558-82cb-4821a96e581d. Трекер-скрипт в index.html + pdf-to-excel/index.html
     (data-domains ограничивает продом). Коммит 745658b.
   - Проверено E2E: реальный Chrome-UA хит → событие в БД (events=1). Headless/curl umami режет как bot
     (это норма). ufw неактивен, порт 8444 открыт снаружи, серт валиден до 23.10.2026.
   - НЕТ авторизации доп.слоя на дашборде кроме логина umami — открыт наружу. Если надо, добавить IP-allow.
6. ПОТОМ блог: 3 pillar-статьи (/blog/...) по кластерам из seo-keywords-pdf-to-excel.md:
   «How to convert Excel to PDF free (without losing formatting)», «How to convert a PDF table to Excel»,
   «Can ChatGPT convert PDF to Excel?». + статья «Insert PDF into Excel» (кластер ~3.6K, KD 30-33).

## Синергия
- PDF-to-Excel v1.0.5 (в проекте Pdftoexel) как раз апдейтится с новой аналитикой оттока — при заливке
  в CWS вписать ссылку на лендинг в поле Website.

## Контекст / доступы
- git identity репо: agent@devexthub.com. Пуш: inline token
  `https://x-access-token:$GITHUB_TOKEN@github.com/Welders-don/devexthub-site`
- Pages API: POST/PUT /repos/Welders-don/devexthub-site/pages, ребилд POST .../pages/builds
- Скриншот лендинга: headless chrome /home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome
  с HOME=.shots/chrome-home, флаги --headless=old --disable-crashpad --force-prefers-reduced-motion
  (reveal-блоки иначе прозрачные на статик-снимке). .shots/ в .gitignore.
- Демо-картинка: assets/pdf-to-excel-demo.png (before/after инвойс→xlsx).
