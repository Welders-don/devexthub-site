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

## UPDATE 2026-07-25 (ночь) — лендинг Transcribe Video to Text ГОТОВ
- Страница /transcribe-video-to-text/ создана по движку pdf-to-excel (общий styles.css, Umami-трекер,
  sticky-шапка, плавающая кнопка, UTM store-ссылки, reveal). CWS ID mgblgaahjeahphiahfakjiabnheanbhj.
  URL: https://www.devexthub.com/transcribe-video-to-text/  (это ссылка в CWS Homepage URL).
- ВАЖНО про имя: внутреннее «Капитан/Capitan» НЕ светим. Изначально сделал путь /capitan/ — ПОФИКСИЛ
  на /transcribe-video-to-text/. В контенте имени нет (везде «Transcribe Video to Text»).
- Заточка под ключи (собраны в этой сессии, см. daily 2026-07-25): H1 «transcript of any video»,
  title под youtube transcript + video to text, секция платформ (YouTube/Vimeo/TikTok/Loom/Coursera),
  FAQ под вопросы (does youtube auto-transcribe, can chatgpt transcribe, how to transcribe).
- Приватность ДВУХУРОВНЕВАЯ (правка Дениса): YouTube+Vimeo — субтитры тянутся В БРАУЗЕРЕ, ничего не
  уходит; остальные площадки — AI-стрим третьей стороны, НЕ хранится, не продаётся. НЕ писать «local».
- Цена: монетизации пока НЕТ ни в одном приложении. Написал просто «free to use», БЕЗ лимитов
  (15/40 Денис не подтвердил). Платный план не упоминаем — введут, поправим одной строкой.
- Демо: CSS-мокап (видео+панель транскрипта), без PNG. og:image пока нет (на CWS-ревью не влияет),
  можно добавить позже.
- Главная: карточка Video to Text с «Coming» → живая ссылка + «Available on Chrome», добавлена в nav.
- Privacy-URL расширения: https://welders-don.github.io/transcribe-video-to-text-privacy/ (в футере).

## ЗА ДЕНИСОМ по Капитану
1. Залить в CWS Homepage URL: https://www.devexthub.com/transcribe-video-to-text/ → submit (ревью ~час).
2. Позже: подтвердить лимиты free-tier если захотим вписать; og:image-картинку; блог-статьи под
   платформенные ключи (transcribe tiktok video KD15, vimeo transcript generator KD20).

## UPDATE 2026-07-25 — добавлены УТП (правка Дениса)
Ключевые отличия от конкурентов, вшиты в лендинг transcribe-video-to-text:
- ЭКСПОРТ В WORD (.docx) — killer-фича, «мало кто из конкурентов делает». + TXT / CSV / SRT (субтитры).
- РАСКЛАДКА ПО СПИКЕРАМ + таймкоды, без мешанины (диаризация) — читается как скрипт, не блоб текста.
Отражено в: hero sub, trust-строке, шаге 3, отдельных фиче-картах (Export to Word / Laid out by speaker),
FAQ (+2: «Can I export to Word?», «Does it separate speakers?»), meta description + og. Демо-мокап
переделан на спикер-раскладку (Speaker 1/2 + таймкоды 00:04/00:11/00:19).
ЖДЁМ от Дениса: 5 промо-картинок с CSV/примером → заменить CSS-мокап на реальный скрин + сделать og:image PNG.

## UPDATE 2026-07-25 — реальные промо-скрины + СТРАНИЦА УШЛА НА РЕВЬЮ
- Денис прислал 5 промо-баннеров (в .media проекта Devexthub-site). Поставлены на лендинг:
  * assets/tvt-demo.jpg (YouTube+панель Transcribe, таймкоды, Export .txt) → hero demo, заменил CSS-мокап.
  * assets/tvt-platforms.jpg (сетка 50+ платформ) → секция «Works where you watch» (под пиллами).
  * assets/tvt-og.jpg (широкий баннер) → og:image + twitter:image (превью в соцсетях).
  * assets/tvt-audio.jpg (Spotify/подкасты) → В ЗАПАСЕ, не вставлен (можно блок про аудио/AI).
- CWS: Homepage URL с лендингом УЖЕ ОТПРАВЛЕН НА РЕВЬЮ Денисом (ревью Капитана ~час).
- Видео для шортса на диске НЕ найдено (ни mp4/mov/webm нигде). Если нужно — пересобирать.
- Мелкий TODO (некритично): в styles.css остались мёртвые .cap-* правила (демо-мокап заменён картинкой);
  рядом живут .platforms/.pill — вычищать аккуратно, только .cap-* строки.

## СЛЕДУЮЩИЙ ЭТАП (решено 2026-07-25, ночь) — «чудо-машина» / общая витрина хаба
Лендинг transcribe-video-to-text ГОТОВ и ушёл на CWS-ревью. Дальше два направления (Денис склоняется
к первому, но можно и оба):
1. ГЛАВНАЯ-ВИТРИНА ХАБА («чудо-машина») — довести devexthub.com/ до полноценной связки всех расширений:
   единая витрина, перелинковка, общий стиль, чтобы домен работал как один продукт и качал вес.
   Сейчас главная =简 черновик (hero + 4 карточки, из них живые pdf-to-excel и transcribe-video-to-text,
   Extract Text и Image Enhancer ещё «Coming»).
2. ЛЕНДИНГИ ОСТАЛЬНЫХ по образцу (Extract Text, Image Enhancer) — как сделали для PDF и Video-to-Text.
   Для каждого: собрать ключи (Semrush руками, KD Easy), заточить страницу, привязать CWS Homepage URL.

Порядок под вопросом — начать с витрины или добивать отдельные страницы. Спросить Дениса при след. заходе.

СТАТУС продуктов в хабе:
- pdf-to-excel/ — ЖИВАЯ, v1.0.5 у Дениса на заливку в CWS.
- transcribe-video-to-text/ — ЖИВАЯ, на CWS-ревью (Homepage URL отправлен).
- extract-text — НЕТ страницы (карточка «Coming»). CWS: Extracttext, у Дениса на заливку (см. его проект).
- image-enhancer — НЕТ страницы (карточка «Coming»). CWS: на review (pkkccllbjokjgkffmjcjigfajhojjlmi).

## UPDATE 2026-07-25 — ГЛАВНАЯ-ВИТРИНА ХАБА собрана (коммит 54fab91, локально, НЕ запушено)
Переделал index.html из черновика в полноценную витрину «чудо-машины» на общем движке (styles.css):
- Hero под всю линейку (H1 «Small browser tools that do one thing well» + подзаголовок convert/transcribe/extract/enhance), 2 CTA (See all tools #tools + Try PDF to Excel), note free/no-signup/browser.
- Trust-полоса: 2 tools live · no sign-up · runs in your browser · free.
- Showcase #tools: 4 карточки с марками XL/VT/TX/IE. Живые (pdf-to-excel/, transcribe-video-to-text/) — класс .tool.live с зелёным dot «Available on Chrome». Extract Text / Image Enhancer — .tool.soon «Coming soon».
- Блок #why «Why Devexthub» (grid3): One job done right / Private by design / No sign-up no friction — общий клей линейки.
- Hub-FAQ #faq (free? / данные? / аккаунт? / браузеры? / новые тулы?).
- reveal-анимации + sticky-шапка + плавающая кнопка «See all tools» (#tools) + Umami-трекер.
CSS: добавлены .tool .mark (квадрат-марка), .tool.live .tag::before (зелёный dot), .tool.soon .mark — в конце styles.css перед .cap-turn.
Карточки ведут на ВНУТРЕННИЕ лендинги (не в CWS) → единая атрибуция через UTM самих лендингов, на хабе store-ссылок нет.
Скриншот проверен: .shots/home.png — раскладка цельная, в фирменном зелёном.

ОСТАЛОСЬ: запушить в Pages (git push → авто-ребилд) — RED, жду ОК Дениса. После пуша www.devexthub.com/ станет витриной.
Дальше по плану: лендинги Extract Text и Image Enhancer по образцу (тогда 2 «Coming» карточки станут живыми).

ПУШ+ДЕПЛОЙ: 4086c4d запушен в Welders-don/devexthub-site, Pages-ребилд (201) докатился. https://www.devexthub.com/ отдаёт витрину (маркеры The lineup / Why Devexthub / tool live подтверждены на живом сайте, HTTP 200). ГЛАВНАЯ-ВИТРИНА LIVE.

## UPDATE 2026-07-25 — ЛЕНДИНГ EXTRACT TEXT LIVE + SEO-заточка по Semrush
- Страница /extract-text-from-image/ создана (движок как pdf/transcribe: styles.css, Umami, sticky, floating CTA,
  UTM campaign=extract-text-from-image, reveal). Демо — CSS-мокап (.ox-* в styles.css: картинка с выделением → панель Extracted text + Copy all / Download .txt). CWS ID eeelkokigmnmogpibbdkjdplpfnobpjb. Privacy https://welders-don.github.io/extracttext-privacy/ (200).
- Приватность честная: OCR локальный (ONNX-wasm на устройстве), картинки не грузятся; только анонимная стата. Модель тянется 1 раз с GitHub-CDN — юзер-данные не уходят.
- На главной карточка Extract Text ожила (.tool.live), счётчик → 3 tools live, ссылка в футер/nav.
- SEO: Денис пробил 4 сида в Semrush (скрины). Данные+стратегия в knowledge/seo-keywords-extract-text.md.
  ВЫВОД: короткие головы-конвертеры KD 54-64 (старые OCR-сайты + Copyfish) — не берём. Целевая зона KD 27-40,
  ~18K/мес: extract text from image (ядро) + how to copy/extract text from image/picture/screenshot + image to text app + best ocr extension for chrome. Синонимы image/picture/screenshot/photo равноправно, продукт назван «OCR Chrome extension».
- Заточка внесена: meta desc, hero sub (picture/screenshot), фича «An OCR Chrome extension», +5 FAQ дословно под хвосты.
- ЗАДЕПЛОЕНО: коммиты f76fff3 (страница) + 58c053f (seo) запушены, Pages ребилд докатился.
  https://www.devexthub.com/extract-text-from-image/ = 200, маркеры подтверждены live.
- ЗА ДЕНИСОМ: вписать Homepage URL https://www.devexthub.com/extract-text-from-image/ в CWS-листинг Extract Text (Additional fields) при след. заливке. Опц.: реальные промо-скрины → заменить CSS-мокап + og:image (как сделали для transcribe).
- ОСТАЛОСЬ по хабу: лендинг Image Enhancer (последняя «Coming» карточка). Он на CWS-review (pkkccllbjokjgkffmjcjigfajhojjlmi) — делать когда пройдёт/будет ID стабилен.

## UPDATE 2026-07-25 — джекпот-ключ, смена акцентов (задеплоено b74df19)
5-й сид (широкий copy/extract text, 145K) дал "copy text from image" 5400·KD21 — лучший ключ ресёрча (легче нашего head 9900·KD44). Плюс jpg to text free 1900·KD22, png to text 1800·KD31, copy text from picture 2900·KD34. Кластер image→Word НЕ берём (мы .txt/копирование, не .docx). Правки: title "Extract & Copy Text from Any Image", meta/og, hero sub ведёт с "Copy the text… JPG or PNG", +FAQ "How do I copy text from a JPG or PNG?". Live-проверено. Данные в knowledge/seo-keywords-extract-text.md.
