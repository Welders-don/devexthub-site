# Метаданные — TVT-лонг #3 «vimeo transcript generator»

**СТАТУС:** ЗАЛИТ 21.09 = **https://youtu.be/LhE12gD3tU8** (29.0с, 1920x1080, голос Puck, сабы Groq).
Ключ: **vimeo transcript generator** — 320/мес, KD 20 (`knowledge/seo-keywords-transcribe.md`).
UTM content: **tvt_long3**. Шортс из того же материала: 13с, 1080x1920, голос Fenrir.
Предыдущие TVT-лонги: #1 18.06 = JOEiN8qOTpA, #2 17.08 = Gv99xOSFys8, podcast 03.09 = i-4eQkuy6Bk.

🔴 ГРАБЛЯ 21.09: первую версию описания выдал БЕЗ ключевиков (три строки + ссылки) и с неверным
UTM (`campaign=tvt_long3` вместо `campaign=transcribe&content=tvt_long3`). Денис поймал.
ПРАВИЛО: описание пишется по эталону `releases/et-anchor3/metadata.md` — ключевые фразы ВНУТРИ
предложений + хештеги, не голые ссылки. Перед написанием открывать metadata.md предыдущего ролика.

## Title
Free Vimeo Transcript Generator in Chrome

## Описание
Need the transcript of a Vimeo video? Here is how to get one in a couple of clicks, free, without
uploading anything.

Transcribe Video to Text is a free Chrome extension. Open any Vimeo video, click the extension and
hit Transcribe. The full transcript appears in the side panel, split by timestamp, so you can jump
straight to the part you need. Copy it, or export it as Word, plain text or SRT subtitles.

The same works for a YouTube transcript, a Loom recording, a Coursera lecture and most video
platforms. No sign-up, no file upload, no watermark.

Get it free: https://www.devexthub.com/transcribe-video-to-text/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tvt_long3

#vimeotranscript #transcriptgenerator #chromeextension #videototext #transcription

## Теги
vimeo transcript, vimeo transcript generator, transcribe vimeo video, vimeo to text,
chrome extension transcript, free transcript generator, vimeo subtitles, video to text

## Закреп-коммент
Free Chrome extension, no signup:
https://chromewebstore.google.com/detail/transcribe-video-to-text/mgblgaahjeahphiahfakjiabnheanbhj

Full guide with screenshots:
https://www.devexthub.com/blog/how-to-get-a-vimeo-transcript/?utm_source=youtube&utm_medium=comment&utm_campaign=transcribe&utm_content=tvt_long3

## Подсказка (Card)
На предыдущий TVT-лонг **i-4eQkuy6Bk** (Transcribe a Podcast to Text, 03.09).

## Сборка (что где)
Сырьё: запись Дениса 21.09, `vimeo.com/1219349233` (K-9INE!, 47K просмотров, 4 дорожки субтитров).
Кропы: браузер `1827:1028:46:0` (убирает таскбар Windows), Word `990:390:440:225`
(убирает имя профиля, русскую ленту и строку с матом).
Раскладка лонга: карточка 2.0 + сцены 24.0 + карточка 3.0 = 29.0с.
Шортс: верх кадр видео `640:360:400:270`, низ панель `470:965:1440:62`, карточка 3.0с.
🔴 Все сегменты рендерить с `-video_track_timescale 30000` — иначе concat -c copy рвёт синхрон.
