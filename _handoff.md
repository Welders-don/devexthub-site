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

## DNS-статус (ВАЖНО — проверить в след. сессии)
- Домен devexthub.com на Dynadot. Зарегистрирован 30.06.2026, продление 30.06.2027 (~$8.99/год).
- apex devexthub.com → A 87.106.208.215 (IONOS, там API/VPN — НЕ трогать).
- Поддомены api, transcribe → A 87.106.208.215 (рабочие, не трогать).
- Денис ДОБАВИЛ 25.07: www → CNAME → welders-don.github.io (TTL 5 min). Account Lock был снят.
- На момент хендоффа `dig www.devexthub.com` ещё пусто (пропагация). ПРОВЕРИТЬ первым делом.

## Следующий шаг (продолжить с этого)
1. Проверить пропагацию: `dig +short CNAME www.devexthub.com @8.8.8.8` → должно отдать welders-don.github.io.
2. Когда резолвится — подключить кастомный домен к GitHub Pages:
   - вернуть файл CNAME: `mv CNAME.later CNAME` (в нём www.devexthub.com), git commit + push;
   - ИЛИ через Pages API: PUT /repos/Welders-don/devexthub-site/pages c cname=www.devexthub.com.
   - GitHub сам выпустит HTTPS (Enforce HTTPS) — подождать до часа.
3. Проверить https://www.devexthub.com/pdf-to-excel/ открывается с валидным TLS.
4. CWS дашборд «Convert PDF to Excel» → Store listing → поле Website →
   `https://www.devexthub.com/pdf-to-excel/` (сейчас там голый api.devexthub.com — слитый DR92-бэклинк). За Денисом.
5. ЭТАП 3 (отложен, ждёт «да» Дениса): поднять Umami на IONOS (Docker+Postgres+nginx-поддомен,
   напр. stats.devexthub.com или :порт) → счётчик на лендинг. Расширений НЕ касается. GlitchTip НЕ ставить.
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
