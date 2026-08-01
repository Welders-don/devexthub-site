# Handoff — Devexthub site (сайт-хаб линейки расширений)

## UPDATE 2026-08-01 — SEO-ДОБОР дальних хвостов (Денис прогнал Semrush из браузера, скрины → карты knowledge/)
Задача: пока есть доступ к Semrush, добрать длинные хвосты со слабым KD про запас под будущий контент.
Свёл + разложил в knowledge/seo-keywords-*.md. Коммиты 190ffe0→54622d2 (9 шт).

СНАЧАЛА исправлена грабля: карты ключей Transcribe НЕ БЫЛО отдельным файлом (лежала размазанной по daily+handoff) —
агент из-за этого решил «ключей нет». СОЗДАН knowledge/seo-keywords-transcribe.md (свёл ключи 25.07 + новый добор).
Ключи Transcribe РЕАЛЬНО были собраны 25.07, по ним 4 статьи+лендинг — ничего не выдумано.

РЕЗУЛЬТАТ по 4 продуктам (детали и цифры — в картах knowledge/):
- Transcribe: ЖИВЫ 2 новых кластера — Zoom recording (KD23-30) + Podcast Spotify/SoundCloud/Apple (KD12-35).
  Interview — узкое ядро how-to-transcribe на 1 device-честную статью (file-mismatch). МИМО: interview/lecture
  «to text» = академ.цитирование (не транскрипция); audio/mp4-to-text = парковка (загрузка файла, расширение только браузер).
- PDF: ДЖЕКПОТ «bank statement → excel» (~4000 показов, KD5-27, платящий интент, идеальный fit) — НОВАЯ вертикаль,
  у нас не покрыта. + под-тема «import PDF into Excel» (~900, Power Query). ПУСТО: invoice (Total240, идёт через
  QuickBooks). extract-table сид = ядро уже покрыто на старте (отсёк python/tabula — не наша аудитория).
- Extract Text: закрыт ранее (4 сида, вся зона KD27-40), добирать нечего — подтвердил Денис.
- Image Enhancer: СТОП. old-photo/restore НЕ БРАТЬ (продукт локальный без AI-реставрации — переобещание, вред домену).
  unblur-ядро (вкл. iphone) взято раньше; iphone-сид перепроверен 01.08 — флагман «how to unblur a photo on iphone»
  590/31 уже покрыт статьёй (28.07), новых кластеров нет. Добор IE закрыт.

ГОТОВЫЕ killer-темы под будущие статьи (с цифрами в картах): «How to convert a bank statement PDF to Excel»,
«How to transcribe a Zoom recording», «How to transcribe a podcast (Spotify/Apple/SoundCloud)».
Плюс: bank statement как use-case на ЛЕНДИНГ /pdf-to-excel/ («Turn bank statements into Excel») — коммерч.конверсия.

УРОКИ: (1) сид «[X] to text» где X=академ.сущность (interview/lecture) падает в in-text citation, не транскрипцию —
не пробивать. (2) Product-honesty: не гнать SEO-трафик на то что продукт не тянет (restore old photo) — злой юзер+вред домену.

## UPDATE 2026-07-30 (вечер) — SaaSHub ЗАКРЫТ по всем 4
- SaaSHub: ET + IE залиты (free) → ВСЕ 4 продукта VERIFIED (PDF, TVT, ET, IE). Площадка закрыта полностью. Реестр offpage/BACKLINKS-LEDGER.md обновлён, коммиты 993a414 + f9d70f3.
- РАЗБОР «заморозки»: это НЕ 30 календарных дней. SaaSHub держит лимит на кол-во продуктов на ревью одновременно; слот освобождается когда предыдущий проходит ревью. TVT прошёл ревью 30.07 → слот открылся → сразу загнали ET, потом IE. Правило «1 домен=1 продукт» на деле не срабатывает — разные лендинги идут как разные продукты.
- ГРАБЛЯ имени: голое «Extract Text from Image» на SaaSHub было занято (already taken) → брендировать «... by Devexthub» (как TVT). ET залит как «Extract Text by Devexthub», IE сразу «Image Enhancer by Devexthub».
- Submission Type ВСЕГДА Free (не Priority+ $75 — это только ускорение очереди + бейдж, для бэклинка смысла нет).
- Логотипы для SaaSHub брали из assets/: extract-text-icon-128.png, image-enhancer-icon-128.png (128×128, их минимум 60px хватает).
- Мелкий хвост (некритично): у ET/IE на SaaSHub можно дозаполнить Release Date (первый день месяца выхода в CWS) — на бэклинк не влияет.
- СЛЕДУЮЩЕЕ off-page: AlternativeTo — TVT выходит из карантина ~3 авг, дальше остальные враздрай.

## UPDATE 2026-07-30 — Featured badge, off-page The Next AI, единый реестр
- ЕДИНЫЙ РЕЕСТР off-page теперь в offpage/BACKLINKS-LEDGER.md (площадка×продукт, статусы). ВЕСТИ его, не размазывать.
- The Next AI (thenextai.com) — ВСЕ 4 залиты (free basic = рабочий dofollow, СТОП с неё снят). OpenAIToolsHub — все 4 (было). SaaSHub — PDF+TVT (ET+IE ждут разморозки ~кон.авг). AlternativeTo — TVT с 3 авг.
- MarketingDB free ИСПОРТИЛСЯ (nofollow+badge); dofollow только Premium $13/one-time — на решение Дениса (совет: взять только PDF, ему нужен вес). SubmitAiTools — Денису проверить условия глазами (за капчей).
- FEATURED BADGE: Transcribe ПОДАН 30.07 на ревью (правильная форма после провала «не туда»). Гайд подачи (где форма, все поля, готовые тексты по 4 расширениям, ID+URL) → workspace/knowledge/cws-featured-badge-guide.md. PDF/ET/IE — ещё не подавали, тексты готовы.
- ИНДЕКСАЦИЯ GSC: главная+TVT+ET+IE индексируются; PDF-лендинг упорно «Discovered - not indexed». Причина НЕ баг (canonical/noindex/ссылки чисты) а конкурентность темы «pdf to excel». Лечится ссылками на /pdf-to-excel/ + Request Indexing + время. CWS-карточка PDF индексируется отдельно (домен Google) — установки идут через магазин, лендинг их не блокирует.
- YouTube шорт PDF: ссылка положена в коммент (кликабельна без verify). Закреп требует verify телефона — забили (не нужно при 0 комментов).
- Осталось: 2я пачка URL на Request Indexing (~20 статей); off-page хвосты в реестре.



## UPDATE 2026-07-29 (вечер) — ВИДЕО-ШОРТС конвейер + новые free-директории
### ГЛАВНОЕ: первый шорт PDF-to-Excel собран и ЗАЛИТ на YouTube
- Файл: releases/shorts/pdf-to-excel-short-v5-voice.mp4 (16.8с, вертикаль 1080x1920, голос).
- Метод (build_short.sh + tts_voice_prompt.json в releases/shorts/, закоммичены; mp4 в .gitignore):
  Денис снимает горизонт-экранку (OBS, весь экран) → грузит на Google Drive (доступ «все по ссылке»)
  → даёт ссылку → агент качает curl (usercontent + confirm=t). ВИДЕО в чат бот НЕ отдаёт (только кадры).
  Монтаж: раскадровка ffmpeg → НЕ один кроп, а 5-6 ЗУМ-ПЛАНОВ по шагам (папка→панель+Convert→Done→
  PDF→Excel→CTA), crop+scale 1080x1920, drawtext оверлеи, concat. drawbox-маска сверху Excel-планов
  прячет русский UI + личное имя. Голос: Gemini TTS (gemini-2.5-flash-preview-tts, voice Puck),
  PCM 24k→wav, atempo под длину, loudnorm I=-16:TP=-1.5. Groq TTS УМЕР. Отдавать через [ВИДЕО:].
- YouTube: залито. Описание со ссылкой на лендинг pdf-to-excel + UTM + хэштеги. ГРАБЛЯ: ссылка в
  описании кликабельна только ПОСЛЕ верификации канала (youtube.com/verify по телефону; SMS не шла —
  пробовать «Позвонить мне»). Публикацию НЕ держит, ссылка подтянется задним числом.
- TikTok: с телефона Денису НЕ дал грузить (старый аккаунт под трекер привычек мешает). Отложено —
  проще завести свежий под devexthub. В описании TikTok ссылку НЕ ставить (режет охват), только bio.
- СЛЕДУЮЩИЕ шорты (тем же конвейером, когда Денис пришлёт экранки ссылкой): Enhancer, Extract Text, Transcribe.

### OFF-PAGE: платные вычеркнуты, найдены 2 новые чистые free
- The Next AI ($199) и AIxploria (платно) — ОКАЗАЛИСЬ ПЛАТНЫМИ, помечены СТОП в transcribe-directories.md.
  Их «Free Basic» таб = обманка. НЕ предлагать как free.
- SaaSHub заморожен на 30 дней (рассматривает предыдущие пакеты) → Extract Text + Image Enhancer туда
  сейчас НЕ грузятся. AlternativeTo — ждём до 3 авг (карантин).
- НАЙДЕНЫ 2 чистые free без обязательного бейджа: MarketingDB (marketingdb.live/submit, dofollow DR60),
  SubmitAiTools (submitaitools.org/submit-your-ai-tool/, капча клик-по-цвету). Twelve.tools — free но с
  reciprocal-бейджем (на усмотрение). findly/Turbo0/Wired — все reciprocal, пропущены.
- ПАКЕТ ГОТОВ: offpage/free-directories-pack.md — поля по всем 4 расширениям (name/URL+UTM/категория/
  short/full/tags/logo). Денис заливает САМ со своего IP, пачкой, с паузами. UTM_source=DIRECTORY менять
  на имя площадки. Иконки всех 4 залиты в assets и LIVE (pdf-to-excel + image-enhancer добавлены сегодня,
  запушены, 200 проверено).

### Метрики (29.07): PDF-to-Excel 5 устан/день без рекламы (было 0). Image Enhancer 9-10/день (самый живой).
### Transcribe: US+JP конвертят/остаются, Европа отваливается → ставка на US.
### Reddit — МЁРТВЫЙ канал (банят на любом заходе), НЕ предлагать.


## UPDATE 2026-07-29 — РЕАЛЬНЫЙ СТАТУС (не предлагать сделанное!)
Грабля: предложил ASO-аудит + GSC как новьё — всё давно закрыто. Факты:
- GSC: sitemap ПОДАН, готово (скрины были). ASO/ключи: у каждого расширения ~30 Semrush-фраз
  уже вшиты в short+long CWS-описание, имя = по жирному незанятому ключу. Аудит прогоняли. НЕ задача.
- Featured-бейдж: подались Капитаном 29.07. Ждём (у коллег висит 1-2 мес).
- Метрики 29.07: PDF-to-Excel 5 устан/день без рекламы (было 0), 1-2 сноса. Image Enhancer самый
  живой — 9-10/день стабильно (и с рекламой, и без). Transcribe: остаются/конвертят US+JP,
  Европа (DE/NL/IT) отваливается → ставка на US, под Европу при ~500 юзерах не выдумываем.
- Из ресёрча (knowledge/extension-growth-research-2026-07.md) незакрытый TIER: Reddit-участие
  (не пиар, ответы на вопросы — лучший retention) + короткое persona-видео (демоабельны OCR/enhancer).


## UPDATE 2026-07-28 (вечер-2) — БЛОГ УГЛУБЛЁН, +8 статей LIVE (26 всего)
### Терминология «фаз» была кривая — исправлена
Слово «Фаза» гуляло в двух смыслах и путало. Теперь так:
- «Базовый блог» = 15 статей (закрыт 25.07, по всем 4 продуктам основной кластер).
- «Углубление» = добор хвостовых ключей по каждому продукту. НЕ старт с нуля.

### Сделано (задепл. + live, коммиты cdd9b36→4267279, запушены)
Блог 18 → 26 статей. +8 углублённых, все HTTP 200 на www.devexthub.com/blog/*, болванка та же
(FAQ-schema, UTM свой campaign, кросс-линковка внутри кластера, ссылка на лендинг+privacy):
- PDF-to-Excel (+2): how-to-convert-a-scanned-pdf-to-excel (OCR/AI-режим, синергия с Extract Text),
  smallpdf-alternative-for-pdf-to-excel (конкурент-ключ, нижняя воронка).
- Extract Text (+2): how-to-copy-text-from-an-image-on-pc (device-хвост PC/Chromebook KD32),
  best-ocr-chrome-extension (честный гайд «на что смотреть» + наш продукт + Copyfish, НЕ фейк-топ).
- Image Enhancer (+2): how-to-make-a-blurry-picture-clear (blurry-кластер),
  how-to-unblur-a-photo-on-iphone (device-хвост; ЧЕСТНО: расширение десктопное, iPhone-фото через AirDrop/iCloud на комп).
- Transcribe (+2): how-to-transcribe-song-lyrics-from-a-video (transcribe song lyrics 260/KD22; честно про пение хуже речи),
  how-to-transcribe-a-video-on-iphone (device-хвост; честно: Live Captions/Voice Memos не дают транскрипт, делать в Chrome на компе).
- sitemap.xml 24 → 32 URL (все 8 добавлены, XML валиден).
ГРАБЛЯ-принцип для будущих iPhone/device-статей: расширения работают ТОЛЬКО в десктоп-Chrome —
в тексте прямо объяснять обходной путь (перенос на комп), не делать вид что ставится на телефон.

### АНАЛИТИКА — по факту пусто (проверено live 28.07)
Вытащил Umami за 30 дней (ssh root@127.0.0.1 → локальный umami 127.0.0.1:3000, минуя nginx basic-auth):
pageviews=1, visitors=1, referrers=[] — тот 1 хит = наш же E2E-тест 25.07. Живого трафика НЕТ.
Причина: домен молодой, органика не запущена (sitemap в GSC не подан), из CWS-листингов на сайт пока не кликают.
ВЫВОД Денису озвучен: аналитика будет пустой пока не появится входящий трафик; чтобы 0 сдвинулся —
нужно (1) органика (пуш live СДЕЛАН + sitemap в GSC — за Денисом), (2) off-page ссылки (идут).
Рецепт запроса Umami-статистики: см. daily 2026-07-28 (логин в локальный umami, wid=9cd8ea39-..., /api/websites/{wid}/stats).

### СЛЕДУЮЩИЙ ШАГ (29.07+) — без изменений, приоритет №1
- ГЛАВНОЕ SEO: подать sitemap в Google Search Console (https://www.devexthub.com/sitemap.xml).
  Денис делает сам (можно с телефона: search.google.com/search-console). Если домен не верифицирован в GSC —
  сначала верификация (DNS-запись на Dynadot или HTML-файл в репо — если попросит, помогу с TXT-записью/файлом).
- SaaSHub: досабмитить Extract Text + Image Enhancer (по одному в день). AlternativeTo Transcribe ~3 авг.
- Контент можно ещё углублять по остальным продуктам, но приоритет теперь off-page + GSC (контента много, трафика ноль).

## UPDATE 2026-07-28 — PDF-to-Excel прошёл CWS, off-page по нему пошёл
### ГЛАВНОЕ: PDF-to-Excel ЖИВОЙ в CWS → 4/4 расширений с официальным store-линком
Теперь все 4 (Transcribe, Extract Text, Image Enhancer, PDF-to-Excel) можно сабмитить на площадки.

### Сделано сегодня
- Написан пакет текстов PDF-to-Excel: offpage/pdf-to-excel-submission-texts.md (по образцу остальных).
- Сверены ВСЕ 4 CWS-ID против первоисточника (хендоффы проектов), все верны:
  PDF-to-Excel = hboeifcemhbamnoakkbalaemdleehfnf (НЕ bhaeff... — то конкурент-двойник 10k/1.9),
  Extract Text = eeelkokigmnmogpibbdkjdplpfnobpjb, Image Enhancer = pkkccllbjokjgkffmjcjigfajhojjlmi
  (НЕ fcded... — то локальный тест-профиль), Transcribe/Capitan = mgblgaahjeahphiahfakjiabnheanbhj.
- OpenAIToolsHub — PDF-to-Excel засабмичен 4-м тулом (теперь там все 4). No-signup, ревью 48ч.
- SaaSHub — PDF-to-Excel: карточка «Convert PDF to Excel» создана (имя прошло без «by Devexthub»),
  VERIFIED (домен совпал с team@), Pricing (Free=Yes, Trial=No, Paid=No), Competitors, логотип залит.
  Логотип брали: Pdftoexel/releases/promo/store-icon-128.png.
- SaaSHub — Transcribe: дозаполнили Competitors (Otter.ai, Rev, Happy Scribe, Sonix — что нашлось в базе)
  + залили логотип Capitan/extension-src/icons/icon128.png (раньше карточку кинули без лого).

### Контент + техническое SEO (вечер 28.07, ЗАЛИТО В ПРОД)
- 3 статьи PDF-to-Excel (блог 15→18), все проверены HTTP 200: how-to-convert-pdf-to-csv,
  how-to-save-an-excel-file-as-pdf, how-to-convert-pdf-to-excel-on-mac (Фаза 1 контент-плана закрыта).
- sitemap.xml (24 стр) + robots.txt — раньше НЕ было. Запушено (490aa43), Pages пересобрал.
- ГРАБЛЯ sitemap: namespace = http://www.sitemaps.org/... (с «s»), не sitemap.org, иначе Google отбивает.

### СЛЕДУЮЩИЙ ШАГ (завтра, 29.07+)
- ГЛАВНОЕ SEO: скормить sitemap в Google Search Console (добавить https://www.devexthub.com/sitemap.xml
  в Sitemaps). Если домен не верифицирован в GSC — сначала верифицировать (DNS на Dynadot или HTML-файл в репо).
- SaaSHub: досабмитить Extract Text + Image Enhancer (правило «по одному в день» на трастовых аккаунтных
  площадках — сегодня уже был PDF, растянуть). Логотипы: Extracttext иконка + Imageenhancer store-icon.
  Competitors из их пакетов offpage/*-submission-texts.md.
- The Next AI (thenextai.com/submit-ai-tool/) — free, форма через JS, нужен скрин формы от Дениса.
- AIxploria (aixploria.com/en/submit-ai-tool-or-feature-company/) — free, многошаговая, брать FREE не upsell.
- AlternativeTo — Transcribe сабмит ~3 авг (карантин аккаунта). Остальные по одному в день после.
- Semrush (Денис из БРАУЗЕРА, не сервер): english long-tail сверх карт + разведка DE-рынка (pdf in excel umwandeln).
- Контент Фаза 2: Scanned PDF to Excel (синергия с Extract Text), Smallpdf-alternative. + Фаза-1 по 3 др. продуктам.

## UPDATE 2026-07-27 (вечер) — OFF-PAGE идёт, техника захода найдена
### ГЛАВНОЕ: как заходим на площадки
Автоматом с сервера НЕЛЬЗЯ — трастовые каталоги за Cloudflare (AlternativeTo, SaaSHub → «Just a moment», не снимается), ToolPilot даёт 429. Датацентр-IP = флаг №1. Креды в /settings (ALTERNATIVETO_*) для входа БЕСПОЛЕЗНЫ — режет по IP не по паролю.
СХЕМА: Денис регается/сабмитит САМ со своего IP (капчу глазами), Пафнутий готовит ПАКЕТЫ текстов + пробивает площадки с сервера на предмет платно/капча/CF (chromium-1208 + playwright-core из npx-кэша, скрипты offpage/*.mjs; техника в memory/2026-07-27.md). Денис шлёт скрины форм → агент говорит что в какое поле.

### СТАТУС off-page по Transcribe Video to Text (лендинг /transcribe-video-to-text/)
- AlternativeTo — ЗАРЕГАН (team@devexthub.com, юзер Devexthub). Карантин 7 дней → сабмит ~3 авг.
- SaaSHub — DONE: карточка «Transcribe Video to Text by Devexthub» (имя без «by Devexthub» было занято), pending approval + VERIFIED (клик по Verify сработал автоматом, домен совпал с team@). Dofollow стоит. Грабли в offpage/saashub-transcribe.md. ВАЖНО: SaaSHub привязан к домену — остальные 3 тула с devexthub.com отдельными карточками могут не влезть, решить при заходе.
- OpenAIToolsHub — DONE: засабмичены ВСЕ 3 тула (Transcribe + Extract Text + Image Enhancer), no-signup форма, ревью 48ч → dofollow DR30 каждому.
- Toolify — СТОП (стал платным $99). ToolPilot — СТОП (требует обратную ссылку + 90 дней).

### ГДЕ ОСТАНОВИЛИСЬ (продолжить отсюда)
Пакеты готовы по всем 3: Transcribe (offpage/transcribe-submission-texts.md), Extract Text (offpage/extract-text-submission-texts.md), Image Enhancer (offpage/image-enhancer-submission-texts.md). PDF-to-Excel пакета ещё НЕТ — написать когда дойдём.
СЛЕДУЮЩИЙ ШАГ: AIxploria (aixploria.com/en/submit-ai-tool-or-feature-company/, ~975k визитов/мес, форма многошаговая, брать FREE не upsell) — залить те же 3 тула. Потом The Next AI (thenextai.com/submit-ai-tool/, free, форма через JS — нужен скрин формы). Денис шлёт скрин формы → агент даёт поля.

### РЕШЕНИЕ по стратегии (сегодня)
- Несколько РАЗНЫХ тулов на одну площадку = ок (это разные продукты, не спам-клоны; OpenAIToolsHub сам зовёт «Submit Another Tool»). Пейсить по-человечески.
- Правило «по одному расширению в день» оставляем ТОЛЬКО для трастовых аккаунтных площадок (AlternativeTo, SaaSHub).
- Legal AI из off-page ВЫЧЕРКНУТ (paywall-провайдер в серой зоне). Идём по 4: Transcribe, Extract Text, Image Enhancer, PDF-to-Excel.
- Спам в gmail от «промоутеров расширений» (ExtensionBooster, Taylor Ashley и пр.) — НЕ отвечать, НЕ покупать (линк-фермы, штраф домену). Это чёрный список.
- PDF-to-Excel долго в CWS-ревью т.к. читает файлы юзера + AI = строгий data-handling тир (норма, не наша ошибка). Права и так узкие, ускорить нечем — ждать.

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

## UPDATE 2026-07-25 — ЛЕНДИНГ IMAGE ENHANCER LIVE + малый баннер Extract Text
- Малый баннер Extract Text переделан (суть не читалась, как у PDF): image→text (картинка с выделением → чистый TEXT + Copied). Лежит в ДРУГОМ репо: ~/projects/Extracttext/releases/promo/tile-440x280.png (+ .html), коммит 332148b. Рендер-рецепт как PDF: headless=old, force-device-scale-factor=2, окно 440x420 → ffmpeg crop 880:560:0:0 + scale 440:280 lanczos (PIL/convert нет, только ffmpeg). ЗА ДЕНИСОМ: залить в CWS Store listing вместо старого.
- Лендинг /image-enhancer/ создан на общем движке. CWS live (v1.0.0 опубликован, id pkkccllbjokjgkffmjcjigfajhojjlmi, стор 200). Privacy https://welders-don.github.io/image-enhancer-privacy/ (200). UTM campaign=image-enhancer.
  Позишн из стора: «Fix blurry, low-quality photos in one click — AI image enhancer that upscales resolution, privately» → локальный on-device AI (WebGPU/wasm), без загрузки.
  Демо: CSS before/after (blurry→sharp, .ie-* в styles.css). Фичи: unblur/sharpen, upscale resolution, no watermark/limit, on-device, «image enhancer for Chrome», free. FAQ под how to unblur / make clear / upscale without losing quality / OCR-extension аналог.
  НЕ переобещал: background remove, colorize, restore old (полная реставрация) — НЕ пишем, только enhance/unblur/sharpen/upscale. Может тормозить на слабом GPU (20-25с) — на лендинге не пишем, просто «in seconds/one click».
- Главная: карточка IE ожила (.tool.live), счётчик → 4 tools live, FAQ «more coming» поправлен, IE в футер. ВСЕ 4 карточки закрыты.
- ЗАДЕПЛОЕНО: коммит b8b3cca запушен, Pages докатился, https://www.devexthub.com/image-enhancer/ = 200.
- ЖДЁМ SEO по IE (Денис пробивает Semrush US): сиды unblur image / upscale image / enhance photo / sharpen image / how to fix a blurry picture / restore old photos / increase image resolution / image enhancer chrome extension. Exclude: ai generator, apk, ios, app, remini, photoshop, tutorial, midjourney, background, remove, cartoon, anime. Гипотеза: головы (image upscaler/unblur) KD-жёсткие (Remini/upscale.media/Let's Enhance), берём экшн-хвосты how to + extension-интент. Козырь: в браузере, без загрузки/ватермарка/лимита, бесплатно. Как придут цифры — заточить title/H1/FAQ (сейчас стоит разумный дефолт).
- ЗА ДЕНИСОМ по IE в CWS: вписать Homepage URL https://www.devexthub.com/image-enhancer/.

## UPDATE 2026-07-25 — IE SEO развёрнут на unblur (задеплоено 96d561e)
Денис пробил 2 сида (blurry + image enhance). blurry-кластер = ЗОЛОТО: ~118K, avg KD 28 (unblur/fix blurry/make clearer). image-enhance забрендован (Picsart/Photoshop/Canva), KD42 — вторым. Развёрнуто: title "Unblur & Fix Blurry Photos, free AI image enhancer for Chrome", meta/og на unblur+fix-blurry, +3 FAQ (fix blurry / less blurry / clean up old — честно без colorize). Данные knowledge/seo-keywords-image-enhancer.md. Live-проверено. НЕ пробито (опц.): upscale image / sharpen image / image enhancer chrome extension.

## UPDATE 2026-07-25 — ДЕНИС ЗАКРЫЛ CWS-часть
Денис: залил новый малый баннер Extract Text в CWS + вставил Homepage URL (www.devexthub.com/...) во ВСЕ листинги
(pdf-to-excel, transcribe-video-to-text, extract-text-from-image, image-enhancer). Пункты «за Денисом в CWS» ЗАКРЫТЫ.
Статус: ждём кто первый выйдет из review (IE v1.0.1, ET, PDF v1.0.5, Transcribe — у всех обновления в очереди).
СЛЕДУЮЩИЙ ЭТАП (план Дениса): наполнять БЛОГ. Порядок: 1) Капитан/Transcribe — несколько статей, 2) PDF (может быстро выйти),
3) потом off-page: по одному ссылки с трастовых сайтов (link building). Блог на том же静 Pages-сайте, /blog/.

## UPDATE 2026-07-25 — БЛОГ запущен, 4 статьи Капитана LIVE
- /blog/ создан (индекс + проза-стиль .post/.post-card/.post-cta/.breadcrumb в styles.css). Blog в nav+футер главной.
- 4 статьи Transcribe Video to Text (болванка: breadcrumb, lede, «fastest way» шаги, 2 CTA-бокса, FAQPage schema, UTM campaign, кросс-линковка, ссылка на лендинг /transcribe-video-to-text/):
  1. how-to-get-a-youtube-transcript (ключ 2400/KD29 + does youtube auto-transcribe + can chatgpt) — флагман.
  2. how-to-transcribe-a-tiktok-video (transcribe tiktok 480/KD15).
  3. how-to-get-a-vimeo-transcript (vimeo transcript 320/KD20).
  4. can-chatgpt-transcribe-a-video (сравнительная, тёплый интент, линкует все 3).
- Денис утвердил формат. Правка: TXT-формат вывода упоминать ЯВНО везде (Word/TXT/CSV/SRT) — расширение реально отдаёт TXT, было пропущено в одном буллете. Внесено в болванку.
- Store id transcribe: mgblgaahjeahphiahfakjiabnheanbhj. UTM: utm_source=devexthub_blog.
- ЗАДЕПЛОЕНО: коммиты 31601c8 (блог+1я) → bc67f9e (+3). Все 4 на www.devexthub.com/blog/*, проверено 200.
- СЛЕДУЮЩЕЕ: PDF-кластер статьи (хвост жирнее). Идеи из seo-keywords-pdf-to-excel.md: "How to convert a PDF table to Excel",
  "How to convert Excel to PDF (without losing formatting)", "Can ChatGPT convert PDF to Excel?", "Insert PDF into Excel".
  Потом off-page ссылки с трастовых сайтов (последняя фаза, когда контент стоит).

## UPDATE 2026-07-25 — +4 статьи PDF-to-Excel LIVE (блог = 8 статей)
Коммит ac31b38. Store id PDF: hboeifcemhbamnoakkbalaemdleehfnf. Privacy: https://devexthub.com:8443/privacy. UTM campaign per article.
Честно: текстовые PDF free, AI-режим сканов — платный opt-in; форматы Excel(.xlsx)/CSV + Excel→PDF. НЕ Word, НЕ Google Sheets (выкинуто).
1. how-to-convert-a-pdf-table-to-excel (core: copy/extract table, keep numbers).
2. how-to-convert-excel-to-pdf (pillar ~2000, without losing formatting + нативный способ через Excel).
3. can-chatgpt-convert-pdf-to-excel (сравнительная: ChatGPT врёт с числами + приватность).
4. how-to-insert-a-pdf-into-excel (кластер ~3600 KD30-33; честно 2 пути: embed object vs extract data).
Все кросс-линкуются между собой и на лендинг /pdf-to-excel/. Проверено live 200, блог-индекс 8 карточек.
ИТОГО блог: 4 Transcribe + 4 PDF = 8 статей.
СЛЕДУЮЩЕЕ (по плану Дениса): off-page — по одному ссылки с трастовых сайтов (link building). Контент под них теперь стоит.
Опц. ещё блог-темы: Extract Text (how to copy text from image/screenshot) и Image Enhancer (how to unblur/fix blurry) — если решим углублять эти два.

## UPDATE 2026-07-25 — БЛОГ ЗАКРЫТ ПОЛНОСТЬЮ (15 статей, коммит a442403)
Добавлены +7 статей той же болванкой (FAQ-schema, UTM, кросс-линковка внутри кластера, ссылка на лендинг + privacy в футере):
Extract Text (store eeelkokigmnmogpibbdkjdplpfnobpjb, privacy welders-don.github.io/extracttext-privacy):
  copy-text-from-an-image (джекпот 5400/KD21), copy-text-from-a-screenshot, extract-text-from-a-picture, convert-jpg-or-png-to-text.
  Честно: отдаёт copy + .txt, БЕЗ Word/docx (проверено грепом).
Image Enhancer (store pkkccllbjokjgkffmjcjigfajhojjlmi, privacy welders-don.github.io/image-enhancer-privacy):
  unblur-a-picture, fix-a-blurry-photo (с «почему размыто»), make-an-image-higher-resolution (upscale).
  Честно: enhance/unblur/sharpen/upscale, НЕ colorize/background/restore; «honest enhancement, not magic» (проверено грепом).
ИТОГО блог: 4 Transcribe + 4 PDF + 4 Extract Text + 3 Image Enhancer = 15 статей, все 200.
ВСЁ ПО КОНТЕНТУ ГОТОВО: витрина + 4 лендинга + 15 статей, всё в едином движке, Umami, UTM, FAQ-schema, кросс-линковка.

## ЖДЁМ + СЛЕДУЮЩЕЕ (решено Денисом)
Ждём когда CWS пропустит обновления (Homepage URL залистится → бэклинки с DR92 качнут домен). Как пройдёт —
заходим на профильные/трастовые сайты ПО ОДНОМУ (link building, off-page). Контент под них уже стоит.
Готовить: список площадок под каждое расширение (директории расширений, Product Hunt, профильные каталоги, гест-посты) + тексты.

## ОТЛОЖЕНО — OFF-PAGE / LINK BUILDING (вернуться КОГДА CWS-обновления пройдут и Homepage URL залистятся)
Задача на будущее (Денис просил не расписывать сейчас, чтоб не потерялось в ленте — поднять КОГДА reviews пройдут):
- Подготовить список профильных/трастовых площадок под каждое расширение + короткие тексты-заявки.
- Заходим ПО ОДНОМУ (не пачкой), отслеживаем что залистилось.
- Категории площадок: каталоги расширений, профильные директории инструментов (OCR/PDF/transcription/photo), гест-посты, Q&A (Reddit/Quora — аккуратно), tool-listicles.
- ВАЖНО про Product Hunt: PDF-to-Excel и Transcribe Video to Text УЖЕ БЫЛИ ЗАЛИСТ�ены на PH и прошли (PDF успешнее Transcribe). НЕ перезапускать эти два на PH. Extract Text и Image Enhancer на PH ещё НЕ были — их можно.
- Контент под ссылки уже стоит (15 статей + 4 лендинга) — есть куда лить и на что ссылаться.

## UPDATE 2026-07-25 — Umami дашборд закрыт basic-auth (nginx-слой)
Денис попросил прикрыть открытый порт 8444. Сделано на IONOS (ssh root@127.0.0.1 passwordless):
- nginx /etc/nginx/sites-enabled/umami.conf: добавлен auth_basic на location / (дашборд/логин), файл /etc/nginx/.umami_htpasswd (644, user=admin, apr1-hash).
- КРИТИЧНО: /script.js и /api/send вынесены в отдельные location с `auth_basic off;` — иначе сбор статы с лендингов сломался бы. Проверено: дашборд без пароля 401, с паролем 200, /script.js 200, /api/send POST 400 (не 401 — сбор работает).
- Креды basic-auth: /opt/umami/BASICAUTH_CREDS.txt на сервере (root:600). Логин самого Umami (admin) остался как был в /opt/umami/ADMIN_CREDS.txt.
- Бэкап старого конфига: /root/umami.conf.bak-<ts>.
- Если стата вдруг пропадёт после этого — первым делом проверить что /script.js и /api/send отдают не 401.

## UPDATE 2026-07-26 — OFF-PAGE СТАРТ (Transcribe), аккаунт для сабмитов
Off-page разморожена: все расширения кроме PDF опубликованы в CWS → Homepage URL залистились → можно линкбилдинг.
Начали с Transcribe Video to Text.

Готово (закоммичено):
- offpage/transcribe-submission-texts.md — заявочные тексты (short/medium/long + Q&A), правило: ссылка на ЛЕНДИНГ не на CWS.
- offpage/transcribe-directories.md — проверенный список 12 живых площадок + топ-5 + статус-трекер + listicle-outreach + что НЕ трогать.

Топ-5 захода: 1.AlternativeTo (DR90,free,dofollow) 2.SaaSHub (DR79,free, верификация по домену) 3.Toolify.ai (DR77,free) 4.ToolPilot.ai (DR77,free) 5.There's An AI For That ($347,рефанд).

РЕШЕНИЕ по аккаунту (важно): заводим ОДИН рабочий аккаунт на каждой площадке под email на домене — под ним все 5 расширений (не по email на продукт! несколько аккаунтов одного бренда = бан).
Денис решил: завести бесплатную почту НА ДОМЕНЕ devexthub.com (трастовее gmail + бонус верификации SaaSHub).

>>> ЗАВТРА (27.07): подсказать Денису КАК завести бесплатную почту на домене devexthub.com.
    Варианты для ответа: Zoho Mail (free до 5 ящиков на своём домене, полноценный приём/отправка — лучший),
    Cloudflare Email Routing / ImprovMX (бесплатный форвардинг на gmail, но без полноценной отправки).
    Проверить где зарегистрирован/делегирован домен devexthub.com (DNS — Pages CNAME, но NS/почтовые записи где?) —
    от этого зависит куда добавлять MX-записи. Дать пошагово. Денис заведёт ящик → бомбим все площадки.

Механика захода (напомнить): playwright-браузер на сервере, куки Дениса ко мне не переедут. Значит либо
креды рабочего аккаунта в /settings → я сабмичу сам, либо Денис сабмитит по готовому пакету. GitHub-логин
отклонён — $GITHUB_TOKEN для браузерного OAuth не годится, а пароль от основного гита давать нельзя.

## UPDATE 2026-07-27 — ПОЧТА НА ДОМЕНЕ ПОДНЯТА + Legal AI вычеркнут из off-page
### Где остановились
Почта team@devexthub.com работает (ImprovMX-форвардинг → gmail). Регистрируемся на AlternativeTo под этим адресом. Сабмит откроется через 7 дней (~3 августа) — правило площадки.

### Почта — ГОТОВО
- Zoho Free ОТПАЛ: EU-датацентр (телефон захардкожен +31, не сменить) + Zoho с 2026 убрал Forever Free для новых в EU/US/AU. Тупик.
- РЕШЕНИЕ: ImprovMX (форвардинг). Бесплатно, без телефона, без карты. Аккаунт ImprovMX: telesinimarco@gmail.com.
- В Dynadot DNS (раздел «1. Запись домена» = apex) добавлены: MX 10 mx1.improvmx.com, MX 20 mx2.improvmx.com, TXT v=spf1 include:spf.improvmx.com ~all. A/CNAME (apex→87.106.208.215, api, transcribe, www→github.io) НЕ тронуты. dig подтверждает MX+TXT.
- catch-all *@devexthub.com → telesinimarco@gmail.com. Рабочий адрес площадок: team@devexthub.com.
- ImprovMX прислал «mail is flowing» = подтверждение. Тест с Proton дошёл (попал в спам gmail — Денис жмёт «Не спам», добавляет в контакты; домен новый = ноль репутации, разово).
- Free = только ПРИЁМ (verify-писем хватает). Отправка от team@ платная $9/мес — пока не нужна, модераторам пишем через веб-формы.

### Legal AI — СТОП в off-page
Ailegal ВЫЧЕРКНУТ. Причина: paywall-провайдер держит в серой зоне («наберите 3-4к юзеров, потом решим»), органически не набрать (нужен платный ИИ). Жечь деньги в неопределённость Денис не хочет.
Off-page идёт по 4 расширениям: PDF-to-Excel, Transcribe, Extract Text, Image Enhancer.

### Анти-бан (правило Дениса)
- Имитировать человека: паузы, скролл, не строчить формы за секунды.
- НЕ пачкой. Схема: 1 расширение → смотрим что залистилось / нет ли флага → через день-два следующее. Площадки тоже враздрай по дням.
- IP-нюанс: агент заходит с серверного IONOS-IP, Денис регал со своего → площадка может насторожиться на смену IP. Для первого сабмита возможно Денису логиниться/сабмитить самому по пакету агента (обсудить на форме AlternativeTo).

### AlternativeTo — регистрация в процессе
- Правило площадки: новый аккаунт НЕ может сабмитить app первые 7 дней (можно голосовать/комментить/редактировать). Регаемся сейчас → сабмит ~3 авг.
- Username (нельзя менять): Devexthub. Email team@devexthub.com.
- Денис положит креды в /settings: ALTERNATIVETO_LOGIN, ALTERNATIVETO_PASS.

### СЛЕДУЮЩИЙ ШАГ
1. Денис дорегистрируется на AlternativeTo, кладёт креды в /settings.
2. За неделю прогрева (до открытия сабмита) АГЕНТ собирает заявочные пакеты по 4 расширениям по образцу offpage/transcribe-submission-texts.md (у Transcribe уже есть). Нужны: PDF-to-Excel, Extract Text, Image Enhancer.
3. ~3 авг — первый сабмит (Transcribe) на AlternativeTo, пройти весь путь, потом остальные враздрай.
