# Handoff 2026-08-16

## План на завтра (16→17.08)
Возвращаемся к Transcribe Video to Text (Capitan). Делаем ДЛИННЫЙ ролик по одному из готовых кластеров, потом shorts из того же материала.
- Кластеры уже собраны (5 блог-статей в Devexthub-site/blog/, НОВЫЙ ресёрч НЕ нужен):
  1. can-chatgpt-transcribe-a-video
  2. how-to-transcribe-a-tiktok-video
  3. how-to-transcribe-a-video-on-iphone
  4. how-to-transcribe-a-zoom-recording
  5. how-to-transcribe-song-lyrics-from-a-video
- Ядро длинного ролика — берём широкий кластер (TikTok или iPhone), если по нему норм. Финальный выбор кластера подтвердит Денис завтра.
- Ротация контента (задал Денис 16.08): Transcribe → PDF-to-Excel → Extract Text по кругу, каждый продукт = пара «длинный ролик + shorts». Заливает Денис сам, я готовлю ролик + тексты (title/описание из ключей/теги/закреп).

## Статус на сегодня
- Image Enhancer шорт Enhance — ГОТОВ и ЗАЛИТ на YouTube (@NicholaChaus). Файл releases/ie-anchor/shorts/short_enhance_v1.mp4.
- TTS-движок: Gemini Puck (~0.25 цента/ролик, проверено). Бесплатный запас Edge-TTS (venv /home/client/projects/edge-tts-venv). Тайминги сабов через Groq STT, НЕ Deepgram (риск гранта).
- Хвост: 2 шорта IE (Upscale 4x, Unblur) не сделаны — не срочно, дрипать позже.

## ПРАВИЛО (Денис требует, 16.08) — отвечать ИЗ ФАКТОВ, не из головы
Как только речь о проекте / нюансах / «что у нас было, что собрано, что поменялось» — СНАЧАЛА лезу в память проекта и файлы, СВЕРЯЮСЬ, и отвечаю фактами. Денис НЕ обязан помнить сколько ключей/кластеров собрано — это моя работа держать и доставать. Не выдумывать «нужен новый ресёрч» и т.п. когда всё уже лежит в проекте. Не гонять его перепроверять зафиксированное.

## 16.08 (вечер) — Transcribe заход утверждён
- Денис согласовал сценарий: широкий ролик «How to get a transcript of any YouTube video — free, in Chrome» под ключ youtube transcript generator free (2400/KD29) + how to get a youtube transcript. Старый ролик Transcribe признан неудачным («мутный»), новый = замена по факту.
- Внутрь широкого — вставка 10с про Auto-detect языков (идея Дениса про «экзотический язык» отклонена как тема ролика: нулевой англоспрос, языкового кластера в ресёрче нет; берём как фичу-вставку).
- ФАКТ ИЗ КОДА (sidepanel.js:268-271): чип Language показывается ТОЛЬКО на Deepgram-пути — `isDeepgramPlatform = !info.isYouTube && !captionTracks?.length`. На YouTube чипа НЕТ. → языковой блок снимать на НЕ-YouTube видео БЕЗ субтитров.
- Ждём футаж OBS от Дениса (2 блока + дропдаун языков крупно). Монтаж/озвучка/тексты — мои.
- Шорт IE Enhance: 28 просмотров за ~3-4 часа (воскресенье, Азия-обед). Для сравнения PDF-шорт v4 = 544/сутки.

### ПОПРАВКА (Денис прав, я ошибся) — на YouTube выбор языка ЕСТЬ
Два РАЗНЫХ дропдауна, я их смешал:
1. `deepgramLangSelector` (чип AUTO) — только Deepgram-путь (не YouTube, нет сабов). Выбор языка РАСПОЗНАВАНИЯ, ~25 языков.
2. `langSelector` (Language: select) — YouTube/нативные сабы. Это ПЕРЕВОД: content.js:221 подставляет через &tlang= 12 языков — en, pt, es, hi, ru, ja, de, fr, it, ko, zh-Hans, ar + оригинальные дорожки видео.
ОГОВОРКА (content.js:209): переводы добавляются ТОЛЬКО если трек взят обычным путём, не pot-путём (`!baseUrl.includes("pot=")`). На видео под анти-ботом/VPN список будет без переводов → перед записью проверить, что в дропдауне 12+ языков.

### Сюжет ролика уточнён (идея Дениса) — учебная лекция
Материал в кадре = длинная лекция/учебный туториал (40+ мин), боль «всю информацию не удержишь».
ВАЖНО: саммари/конспекта в расширении НЕТ (греп по extension-src пустой) — не обещать «готовый конспект».
Честная подача: полный текст → Ctrl+F по термину → экспорт Word → вставил в ChatGPT для конспекта (это ещё и добивает наш кластер can-chatgpt-transcribe-a-video).
Языковой блок теперь СНИМАЕТСЯ НА YOUTUBE (перевод лекции на хинди/испанский) — отдельное не-YouTube видео больше НЕ нужно.

## ФУТАЖ Transcribe ПОЛУЧЕН (16.08, 14:25) — releases/transcribe-anchor/src/compressed_2026-08-16_14-25-10.mp4
122с, 1920x1080, 30fps, ~12МБ (в git НЕ коммичу, бинарь). Кадры-превью: releases/transcribe-anchor/frames/.
Материал в кадре: YouTube «Claude Code - Full Tutorial for Beginners» (Tech With Tim, 35:18, 1.4M просмотров) — учебный туториал, ровно та боль что хотел Денис.
Хронометраж:
- 0:00-0:15 сайдпанель, кнопка Transcribe, счётчик «13 AI transcriptions left · YouTube unlimited»
- ~0:20 транскрипт EN готов: 148 paragraphs, таймкоды, кнопки Copy / .doc (Word) / Export
- ~0:40 переключение языка → «Loading subtitles»
- ~1:00 японский (ja), 84 paragraphs
- ~1:20 окно Downloads → запуск Word
- ~1:40 испанский (es), 149 paragraphs
- ~1:50 ОТКРЫТЫЙ .doc в Word: испанский текст с таймкодами [0:34][0:50]..., 37 400 знаков ← кульминационный кадр
ГРАБЛИ футажа (лечу кропом): русский интерфейс Word/Windows + имя «Денис Торопов» в шапке Word + таскбар с Яндексом. Кроп верх/низ решает.
НЕ снято: Ctrl+F по термину, экспорт SRT. Обхожусь без них, доснимать не прошу.

## ЗАВТРА 17.08 — первым делом
Transcribe-лонг `releases/transcribe-anchor/tr-anchor-final.mp4` (34с) аппрувнут, заливает Денис завтра.
ПЕРЕД ЗАЛИВКОЙ написать ему: title + описание + теги + текст закреп-коммента (ключ youtube transcript generator free 2400/KD29, ссылка = лендинг /transcribe-video-to-text). Детали в releases/transcribe-anchor/_handoff.md.

## 16.08 (вечер) — GSC-срез + 3 статьи best-*-chrome-extension ВЫЛОЖЕНЫ
Повод: GSC Performance экспорт 16.08 (данные 27.07-14.08). Разбор → ~/workspace/knowledge/gsc-devexthub-search-2026-08-16.md.
Вывод: домен ранжируется ТОЛЬКО на запросах со словом extension/chrome/chromebook (поз 10-15), общие ключи (jpg to text) — поз 87, мусор. Образец окупаемости = best-ocr-chrome-extension (608 показов, поз 36.5).
Написаны и ЗАЛИТЫ (push 7416a17, все три отдают 200):
- /blog/best-video-transcript-chrome-extension/
- /blog/best-image-enhancer-chrome-extension/
- /blog/best-pdf-to-excel-chrome-extension/
Формат по образцу best-ocr: критерии выбора → наш продукт по шагам → CTA с UTM → честный блок про конкурентов → перелинковка на свои how-to. FAQPage JSON-LD на каждой. Карточки в blog/index.html + 3 записи в sitemap.
Честность (специально): в Transcribe-статье НЕ обещаю приватность (не-YouTube идёт через облако), в Enhancer-статье прямо сказано что безнадёжный расфокус не восстановить.
Следующий замер отдачи — через 2-3 недели по GSC (позиции этих 3 URL + показы по extension-ключам).


# ============ ИТОГ ДНЯ 16.08.2026 ============

## Что закрыто сегодня
1. Transcribe якорный лонг СОБРАН И АППРУВНУТ: releases/transcribe-anchor/tr-anchor-final.mp4 (34с, 1080p, −14 LUFS). Футаж от Дениса (Claude Code туториал 35:18), голос Gemini Puck, сабы Groq. Скрипт сборки build_transcribe_anchor.sh, детали и грабли — releases/transcribe-anchor/_handoff.md.
2. GSC Performance разобран (данные 27.07-14.08) → ~/workspace/knowledge/gsc-devexthub-search-2026-08-16.md. Главное: домен ранжируется ТОЛЬКО на extension/chrome/chromebook-запросах (поз 10-15), общие ключи поз 80-90 = мусор.
3. Написаны и ЗАЛИТЫ 4 статьи (все отдают 200):
   - /blog/best-video-transcript-chrome-extension/
   - /blog/best-image-enhancer-chrome-extension/
   - /blog/best-pdf-to-excel-chrome-extension/
   - /blog/how-to-copy-text-from-an-image-on-a-chromebook/ (ключ уже на поз 9.7 БЕЗ статьи, лучшая позиция сайта)
4. Построен кросс-кластерный мост: 4 контекстные ссылки из сильных ET-страниц в висящий PDF-кластер + ссылка с PC-статьи на Chromebook-статью.
5. Таймер: weekly GSC-срез, понедельник 11:00 Китая (id gsc-devexthub-weekly, ~/.iia/schedules.json).

## ЗАВТРА 17.08 — единственная горящая задача
Перед заливкой ролика написать Денису: title + описание + теги + текст закреп-коммента.
Ключ: youtube transcript generator free (2400/KD29) + how to get a youtube transcript. Ссылка везде = лендинг https://www.devexthub.com/transcribe-video-to-text (НЕ CWS). Напомнить про закреп-коммент (в описании ссылка не кликается, время-гейт канала). Тексты в <code>-блоках, без тире.

## Отложенные хвосты (НЕ горит)
- Шорты из Transcribe-футажа (языки / экспорт в Word / 35 мин → текст) — следующий оборот круга.
- Хвост IE: шорты Upscale 4x и Unblur, голос-тексты готовы в releases/ie-anchor/_handoff.md.
- Через 2-4 недели проверить: вышел ли PDF-кластер из «Discovered, currently not indexed» после моста, и попали ли 4 новые статьи в индекс. Если PDF не сдвинулся — замораживаем кластер, дело во внешних ссылках.
- ВАЖНО не забыть: перелинковка НЕ объясняет разрыв PDF/ET (посчитано, плотность у PDF даже выше). Не повторять вывод «нашли причину».
