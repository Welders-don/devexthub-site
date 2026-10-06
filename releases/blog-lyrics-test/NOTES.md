# Тест: тексты песен через движок продукта (06.10.2026)

Записи: Wikimedia Commons, все Public domain (оркестры армии/ВВС США), тексты песен тоже PD.
Аудио в git не кладём (*.mp3/*.ogg), ссылки ниже.
- army.mp3: The Army Song, Band and Chorus, US Army Band, 66 с, хор + оркестр
- angels.ogg: Angels We Have Heard on High, хор a cappella, 44 с
- yankee.ogg: Yankee Doodle (choral), 98 с
- grace.mp3: Amazing Grace, solo vocalist + guitar, USAF Reserve Band, 130 с

| запись | Deepgram nova-3 (как в продукте) | nova-2 | Whisper large-v3-turbo (Groq) |
|---|---|---|---|
| army (хор+оркестр) | 0 слов | 0 | 103 слова, почти весь текст (sing a song вместо sing our song, cages вместо cadence, high high day вместо Hi Hi Hey) |
| angels (хор a cappella) | 0 | - | 24 слова, почти идеально (joyous face вместо joyous strains) |
| yankee (хор) | 0 | - | 87 слов, ошибки: Genki-doodle, thick as things he could, в конце галлюцинация «Thank you.» |
| grace (соло + гитара) | 12 слов из ~75: первая строка + мусор | - | 75 слов, почти дословно |

Deepgram: prerecorded, smart_format, diarize, language=en, ключ DEEPGRAM_API_KEY_VIDEO_CWS. Groq: GROQ_VOICE_API_KEY, language=en.
Стоимость: DG ~5.6 мин ≈ $0.03, Groq ≈ $0.01.

Вывод по продукту (наблюдение на 4 записях, не замер по юзерам): путь записи вкладки (Deepgram) пение
практически не распознаёт. Путь субтитров YouTube зависит от субтитров ролика (авто-сабы песен бывают мусором,
см. снос DE 19.09 «Heat. Heat.»). Whisper на тех же файлах берёт текст песен.
