# Тест для статьи can-chatgpt-transcribe-a-video (06.10.2026)

Источник: archive.org QdL2vJgQvTEVmTtxp4oAxOxEhHxCUJ (JFK, Rice University 1962, фильм Periscope, 1428 с; Кеннеди с ~14:19, фильм без части речи).
jfk.mp4 / jfk.mp3 / dg.json / *.png в git НЕ кладём (репо публичный, вес). Воспроизвести: скачать mp4, ffmpeg -vn -ac 1 -ar 16000 → mp3.

- Deepgram prerecorded nova-3, smart_format, diarize, language=en, utterances (в продукте live nova-3 те же флаги). Ключ DEEPGRAM_API_KEY_VIDEO_CWS (грант Капитана), DEEPGRAM_API_KEY = 401 Invalid credentials. 5.4 с, ~$0.10.
- 2344 слова, 369 реплик, 4 спикера. Сверка с официальным текстом rice.edu/kennedy по части Кеннеди: 1109 слов DG, ~14 реальных ошибок (пропуски in/and/which/by, shelter→shelters, moved→move, revolutions→revolution, but→about), числа словами, Mr→mister. Rice→Bryce в речи Питцера.
- llm.summarize (после фикса Gist) 42 с $0.0015; llm.polish 30 с $0.0024, 3 куска, 0 откатов. Ключ OPENROUTER_API (не прод).
- Скрины: shot.js на тестовой БД /tmp:5499 → assets/blog/tvt-jfk-*.webp. Рендер статей: render.js.
