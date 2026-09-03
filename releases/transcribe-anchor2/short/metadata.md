# Transcribe шорт #2 — метаданные для заливки

Файл: `tr-short-final.mp4` (17.4с, 1080x1920, 30fps, 1.9 МБ, звук AAC 160k)
Голос **Fenrir**, энергичная подача, 12.81с, adelay 300мс. Караоке-сабов НЕТ — только крупные
drawtext сверху и снизу (рецепт залетевшего PDF-шорта, 694 просмотра).
Ключ берётся у своего лонга (`transcribe podcast`) с разводящим хвостом, чтобы не бодаться
с прошлыми шортами Transcribe по одному запросу.

## Title
```
Transcribe a podcast to text in Chrome (Apple Podcasts) #shorts
```

## Описание (ПЕРВОЙ строкой — внутренняя ссылка на лонг, она кликается без верификации)
```
Full tutorial: https://youtu.be/i-4eQkuy6Bk

Open the episode in your browser, hit Transcribe, and the text is written as it plays - split by speaker, with timestamps. Then export it to Word.

Free extension: https://www.devexthub.com/transcribe-video-to-text/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_short2

Written guide (Spotify and SoundCloud too): https://www.devexthub.com/blog/how-to-transcribe-a-podcast/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_short2
```

## Закреп-коммент (ставить на youtube.com, НЕ в Studio)
```
Full tutorial: https://youtu.be/i-4eQkuy6Bk

Free extension: https://www.devexthub.com/transcribe-video-to-text/?utm_source=youtube&utm_medium=video&utm_campaign=transcribe&utm_content=tr_short2
```

## Структура (17.4с)
0:00 хук — панель со SPEAKER 1/2, таймкодами и кнопками Copy / .doc / Export,
низ «speakers and timestamps» 3.0с →
«One click in your browser» 2.0 → «Press Transcribe» 1.4 →
«It writes as the episode plays» 2.6 → «Who said what, and when» 2.2 →
«Export to Word» 1.6 → страница Word целиком, низ «Full tutorial on my channel ->» 2.4 →
энд-карточка (эмблема + Transcribe Video to Text + Free on Chrome + devexthub.com) 2.2

## Грабли этой сборки
- **ЧИТАЕМОСТЬ В ВЕРТИКАЛИ.** Первая версия ставила хуком страницу Word — на телефоне
  нечитаемо: документ 1030px растягивается до 1080, увеличения почти нет. Тугая полоса
  (crop 430px по высоте) не спасает, режет строки на середине.
  ПРАВИЛО: читаемый текст в шорт берём ИЗ САЙДПАНЕЛИ (там крупный шрифт), а страницу Word
  показываем целиком как ОБРАЗ документа — читать её зритель не должен.
- Related для Shorts у молодого канала недоступен, мост шорт→лонг держится на первой строке
  описания и закреп-комменте.
