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
1. РОЛИК АППРУВНУТ Денисом 16.08 («отлично получилось»). Заливка — ЗАВТРА 17.08, заливает Денис.
2. ❗ЗАДАЧА НА 17.08 ПЕРЕД ЗАЛИВКОЙ: написать Денису метаданные — title, описание, теги, текст закреп-коммента.
   Ключ: youtube transcript generator free (2400/KD29) + how to get a youtube transcript. Ссылка в описании и в закрепе = ЛЕНДИНГ https://www.devexthub.com/transcribe-video-to-text (не CWS).
   Напомнить про закреп-коммент: ссылка в описании не кликается (время-гейт канала), кликается только в комменте.
   Отдавать текст в <code>-блоках для копипаста, без тире.
3. Шорты из этого же футажа на следующий оборот круга: (а) языки, (б) экспорт в Word, (в) 35 мин → текст.
