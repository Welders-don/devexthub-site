# Handoff — Transcribe якорный лонг (2026-08-16)

## Готово
- `tr-anchor-final.mp4` — 34.0с, 1920x1080, 30fps, 5.6МБ, звук −14 LUFS. НА ПРОВЕРКЕ У ДЕНИСА.
- Сборка: `build_transcribe_anchor.sh` (тот же рецепт что build_ie_anchor.sh: сегменты→concat -c copy→сабы→голос→loudnorm).
- Голос: Gemini TTS `gemini-2.5-flash-preview-tts` voice Puck, промпт «energetic, upbeat, fast-paced hyped YouTuber voice». Текст в `voice_script.txt`, 33.17с.
- Пословные сабы: Groq STT whisper-large-v3 word-timestamps (`groq_words.json`) → `subs.srt` (2 слова, заглавные, MarginV=40). Правка вручную: Groq услышал «devxhub.com» → в сабах DEVEXTHUB.COM.
- Сдвиг видео = голос + 0.4с (голос с adelay=400).

## Структура (34с)
карточка 2с → WIDE «A 35 minute tutorial» → PANEL_TOP «One click in the side panel» → PANEL_TEXT «Full transcript, with timestamps» → PANEL_TOP «Now switch the language» → Spanish/Japanese/Portuguese по 1.6-1.7с → PBTN «Export as Word, TXT or SRT» → WORD «37,000 characters of study notes» → PANEL_TOP «YouTube transcripts stay unlimited» → энд-карточка «Free on devexthub.com» 3.3с

## ГРАБЛИ (новые, записать в общий рецепт)
- drawtext НЕ терпит ДВОЕТОЧИЕ в тексте — титр молча обрезается по «:». (Запятая внутри text='...' работает нормально.) Было «Export: Word, TXT, SRT» → в кадре только «Export». Фикс: формулировать без двоеточий.
- Кроп WIDE: `crop=1920:965:0:60` — иначе в кадр лезет русский таскбар снизу и адресная строка сверху.
- Кроп WORD: `crop=1120:760:310:240` — срезает русский риббон Word и имя владельца в шапке.
- ffprobe scene-detect по этому футажу почти пустой (статичная страница) — разметку делал контактками tile из кропа сайдпанели, шаг 2с.

## Дальше
1. ЗАЛИТ 17.08 Денисом: https://youtu.be/Gv99xOSFys8 (канал @NicholaChaus). Метаданные (title/описание/теги/закреп) выданы 17.08, ссылка везде = лендинг https://www.devexthub.com/transcribe-video-to-text/
   Подсказка (Card) на 00:28 → IE-лонг youtu.be/QtE2CfgRJHo. ОБРАТНАЯ подсказка в IE-лонге на Gv99xOSFys8 — проверить, поставил ли Денис.
   ФАКТ 17.08: в подсказках доступны Видео/Плейлист/Канал, тип «Ссылка» СЕРЫЙ (внешние URL только для YPP). Значит внешняя ссылка по-прежнему только через закреп-коммент.
2. ✅ Метаданные выданы 17.08: title «Free YouTube Transcript Generator in Chrome | Any Video to Text in 1 Click», описание вокруг ключей youtube transcript generator free (2400/KD29) + how to get a youtube transcript, теги, закреп-коммент со ссылкой на лендинг.
   Ссылка в описании НЕ кликается (время-гейт канала) — кликается только в закреп-комменте.
3. ✅ ШОРТ #1 СОБРАН 20.08 — `short/tr-short-final.mp4` (15.5с, 1080x1920, 3.1 МБ), ждёт заливки Денисом.
   Метаданные под ключ: `short/metadata.md`. Сборка: `short/build_transcribe_short.sh`.
   Рецепт = тот, что залетел на PDF-to-Excel (544 просмотра за сутки): энергичный Puck + КРУПНЫЕ оверлеи, БЕЗ караоке-сабов — у победителя их не было (проверено по build_short.sh, сабы появились позже и только на лонгах).
   Хук = стена длинных роликов в ленте YouTube (1:00:49 / 31:04 / 37:02) + «35 MINUTES EACH / NOBODY HAS TIME».
   Плашка-мост «Full tutorial on my channel» вшита в план EXPORT TO WORD.
   Все три исходных угла ((а) языки, (б) Word, (в) 35 мин → текст) вошли в шорт #1. Хвост на следующий оборот ротации: экспорт SRT, «Any video» (Vimeo/Udemy/Zoom), 37 000 знаков конспекта.
   Исходный футаж: src/compressed_2026-08-16_14-25-10.mp4
   Мост шорт→лонг Gv99xOSFys8, по надёжности: (1) ВНУТРЕННЯЯ youtu.be в ОПИСАНИИ первой строкой — кликается без верификации, проверено 03.08 на шорте PDF v4; (2) закреп-коммент; (3) поле Related video при заливке (03.08 было под время-гейтом, статус на 20.08 не проверен); (4) плашка в кадре.
   НЕ ПУТАТЬ: время-гейт держит только ВНЕШНИЕ ссылки (лендинг). Внутренние youtu.be живые с самого начала. Подсказок (Cards) в шортах НЕТ.
