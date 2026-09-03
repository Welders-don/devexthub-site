# Transcribe лонг #2 — метаданные для заливки

Файл: `tr2-anchor-final.mp4` (26.4с, 1920x1080, 30fps, 2.3 МБ, звук AAC 192k)
Ключ из `knowledge/seo-keywords-transcribe.md`: **transcribe podcast** 480/KD30
(рядом в кластере: `transcribe podcast to text` 170/27, `podcast transcription service` 390/18,
`transcript generator for apple podcasts` 140/26). Ключ стоит В НАЧАЛЕ титула.

## Title (98 симв)
```
Transcribe a Podcast to Text - Free Chrome Extension (Apple Podcasts, Spotify, SoundCloud)
```

## Описание
```
Transcribe a podcast to text without leaving your browser. Open the episode on Apple Podcasts, Spotify Web Player or SoundCloud, click the extension, press Transcribe - and the text is written as the episode plays, split by speaker and stamped with the time. Then copy it or export it straight to Word.

Get the extension (free, no sign-up):
https://www.devexthub.com/transcribe-video-to-text/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_long2

Step by step guide:
https://www.devexthub.com/blog/how-to-transcribe-a-podcast/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_long2

What you get
- Speaker labels and timestamps, automatically
- Export to Word, TXT or SRT
- Nothing uploaded from your computer, the audio is read from the tab

Honest limits
- One session runs up to 40 minutes, longer episodes are done in parts
- Podcast platforms carry no captions, so the episode is transcribed by AI and uses the free monthly allowance. YouTube and Vimeo have their own captions and stay unlimited
```

## Теги
```
transcribe podcast, podcast to text, podcast transcription, apple podcasts transcript, spotify podcast transcript, soundcloud to text, podcast transcript generator, chrome extension, transcribe audio to text, speaker labels
```

## Закреп-коммент (ставить на youtube.com, НЕ в Studio, сначала проверить, нет ли своего)
```
Free extension: https://www.devexthub.com/transcribe-video-to-text/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_long2

Full written guide with the Spotify and SoundCloud steps: https://www.devexthub.com/blog/how-to-transcribe-a-podcast/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_long2
```

## Структура ролика (26.4с)
карточка 2.0с (эмблема + «Transcribe Video to Text» / «Turn a podcast into text, free in Chrome») → WIDE «An episode you need in text» 3.0 →
MENU «Click the extension in your toolbar» 1.6 → PTOP «Press Transcribe, then play» 2.8 →
PTEXT «The text is written as it plays» 3.2 → PSCROLL «Speakers and timestamps, automatic» 3.4 →
PEXP «Copy it, or export to Word» 2.6 → WORD «Your episode, as a document» 4.6 →
энд-карточка «Transcribe Video to Text / Free on devexthub.com» 3.2

Голос: Gemini TTS `gemini-2.5-flash-preview-tts`, **Puck**, 20.09с, adelay 2000мс
(стартует после стартовой карточки, заканчивается на входе энд-карточки).
Пословные сабы: Groq whisper-large-v3 → `work/subs.ass`, ВНИЗУ кадра (Alignment 2, MarginV 64) —
смысловые титры у этого ролика сверху, два слоя в одном месте = шум.

## Грабли этой сборки
- Окно открытой выпадашки расширений в футаже узкое: **3.5-5.5с**, на 6.0с панель уже открыта.
  Первая сборка брала ss=4.4 d=2.2 и во второй половине сегмента показывала не меню, а панель.
- Кроп WORD: `crop=1030:800:436:130` режет шапку Word с именем «Денис Торопов» и русскую
  ленту с плашкой «ЗАЩИЩЕННЫЙ ПРОСМОТР». Масштаб 1040 (не 1360) — иначе документ занимает всю
  высоту и титру негде встать, не задевая сабы.
- Таскбар Windows (Яндекс, раскладка РУС) начинается на y=1032, WIDE режем по 1010.
- **СТАРТОВАЯ КАРТОЧКА НЕСЁТ ПОЛНОЕ ИМЯ РАСШИРЕНИЯ** (поправка Дениса 03.09). Первая сборка
  ставила рядом с эмблемой «Transcribe a Podcast» — читалось как название продукта, а искать
  по нему в сторе нечего, настоящее имя всплывало только в энд-карточке на 23-й секунде.
  Правило шире одного ролика: у стартовой карточки первая строка = имя продукта, задача уходит
  во вторую строку и в озвучку.
