# Handoff — Devexthub site (сайт-хаб линейки расширений)

## Где остановились (2026-07-25, вечер)
DNS + TLS www.devexthub.com живые, Umami-аналитика поднята на IONOS и подключена к лендингам,
сделана новая Small promo tile для PDF-to-Excel. Ждём: Денис зальёт PDF-to-Excel v1.0.5 в CWS
(аналитика оттока + новая плитка + Website-ссылка). Следующая задача — лендинг Капитана.

## Сделано в этот заход (вечер 25.07)
- DNS www пропагировался → CNAME подключён к Pages, TLS approved, Enforce HTTPS ON.
  https://www.devexthub.com/pdf-to-excel/ = 200 + валидный HTTPS. (детали ниже в «DNS-статус»)
- Umami self-host на IONOS поднят и E2E-проверен. (детали ниже в «ЭТАП 3»)
- Новая Small promo tile 440x280 для PDF-to-Excel: PDF↔Excel визуал, двусторонняя жирная SVG-стрелка,
  цветной диагональный градиент (синий→циан→зелёный), белый заголовок. Живёт в ДРУГОМ репо:
  ~/projects/Pdftoexel/releases/promo/tile-440x280.png (+ исходник tile-440x280-v3.html), коммит ab301df.
  Рендер-рецепт: headless=old, 2x в окно 440x420, потом ffmpeg crop 880x560 + scale 440x280 lanczos.
  ВАЖНАЯ ГРАБЛЯ: chrome --headless=NEW клипает низ вьюпорта при window 440x280 (заголовок пропадал 6 раз) —
  рендерить в ВЫСОКОЕ окно (420) и кропить ffmpeg. PIL/convert на машине НЕТ, только ffmpeg.

## Обсудили (стратегия, решений по коду не приняли)
- host_permissions: аудит манифестов — <all_urls> у Capitan, Extracttext, Ailegal; Pdftoexel только
  api.devexthub.com/* (узко, ок); Imageenhancer без host. Вывод: НЕ раздавать <all_urls> впрок
  (CWS тормозит/режектит неоправданные права — причина медленного ревью Капитана). Правильно —
  optional_host_permissions + запрос в рантайме при первом использовании фичи (нет install-варнинга,
  нет слепого update-промпта существующим). Возможный TODO: проверить, реально ли Extracttext/Ailegal
  нужен <all_urls>, или это лишний груз.
- Почему PDF-to-Excel ревьюится дольше Капитана: не аккаунт, а permissions/чувствительность (читает
  файлы юзера + AI) → больше проверок Google. Это норма.
- Website-поле в CWS (Homepage URL в блоке Additional fields) — просто ссылка, permissions/privacy
  не меняет, тип расширения не трогает.

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
1. ЗА ДЕНИСОМ — залить PDF-to-Excel v1.0.5 в CWS: cancel review 1.0.4 → upload zip
   (~/projects/Pdftoexel/releases/Convert-PDF-to-Excel-1.0.5.zip) → в Store listing загрузить новую
   Small promo tile (~/projects/Pdftoexel/releases/promo/tile-440x280.png) → вписать Homepage URL
   `https://www.devexthub.com/pdf-to-excel/` (блок Additional fields) → submit.
2. СЛЕДУЮЩАЯ ЗАДАЧА (агент) — лендинг Капитана на devexthub.com (страница /capitan/ по образцу
   /pdf-to-excel/, с трекером Umami + ссылкой в CWS). Капитан ревьюится быстро → можно раскачивать
   сразу, пока PDF догоняет. Заточить под SEO-ключи Капитана (screen recorder и т.п.).
3. ПОТОМ блог: 3 pillar-статьи (см. п.«блог» ниже).

--- УЖЕ СДЕЛАНО (для истории) ---
DNS+Pages+TLS: см. секцию «DNS-статус — ГОТОВО» выше. Umami: см. «ЭТАП 3» ниже.
Website-поле = Homepage URL в Additional fields (не отдельное «Website»).

ЭТАП 3 — ГОТОВО (25.07): Umami self-host на IONOS поднят и подключён к лендингам.
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
