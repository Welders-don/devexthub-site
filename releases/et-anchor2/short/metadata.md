# Метаданные — ET-шорт #1 захода №2 («обвод области на странице»)

Файл: `et-short-final.mp4` (15.1с, 1080x1920, 1.0 МБ, −14.8 LUFS, голос **Fenrir**).
Футаж тот же, что у лонга: `../src/compressed_2026-08-25_12-37-20.mp4`. Новой съёмки не было.
Сборка: `build_et_short.sh`, голос `gen_voice.py`.

Угол НЕ повторяет заход №1 (там были «загрузи фото» и «Ctrl+V картинку»,
`releases/shorts/et-shorts-metadata.md`). Здесь: текст сидит в картинке на живой веб-странице,
мышь его не выделяет, обвод рамкой прямо поверх страницы.

## Title (макс 100 симв, КЛЮЧ В НАЧАЛЕ)
Copy text from an image on a website (free Chrome extension) #shorts

Ключ: **copy text from image** 5400/мес, KD 21 (`knowledge/seo-keywords-extract-text.md`,
сид «широкий copy/extract text»). Тот же ключ, что у лонга захода №2 — по образцу PDF-захода,
где шорт брал ключ своего лонга («Bank statement PDF to Excel in one click»).
Хвост «on a website» разводит с шортом захода №1 («Copy text from any photo in one click»),
чтобы два своих ролика не бодались одним запросом.

МОЙ ФАКАП 27.08, зафиксирован: первая версия титула была «Text you can't select? Copy it anyway»
— хук без единого ключа из файла ресёрча, придуман мимо процесса. Денис поймал.
Правило: title берётся из `knowledge/seo-keywords-*.md`, ключ в НАЧАЛЕ строки. Хук живёт
в первой строке тела описания, а не в титуле.

## Описание
Full tutorial: https://youtu.be/YBuAdO9E4cU

The words are right there but the cursor just drags the picture around. That text is an image.

Here is how to copy text from an image on any website in one click. Extract Text from Image reads
it right on your device and gives you real, selectable text. Free Chrome extension, no signup,
nothing uploaded to a server.

Get it free: https://www.devexthub.com/extract-text-from-image/?utm_source=youtube&utm_medium=video&utm_campaign=extracttext&utm_content=et_short2

#copytextfromimage #ocr #chromeextension #imagetotext #productivity

## Теги
copy text from image, text you cannot select, extract text from image, screenshot to text,
image to text, ocr chrome extension, free ocr, copy text from a website

## Закреп-коммент
Free Chrome extension, no signup:
https://chromewebstore.google.com/detail/eeelkokigmnmogpibbdkjdplpfnobpjb

How it works, with examples:
https://www.devexthub.com/extract-text-from-image/?utm_source=youtube&utm_medium=video&utm_campaign=extracttext&utm_content=et_short2

## При заливке
- Мост на лонг `youtu.be/YBuAdO9E4cU` ПЕРВОЙ строкой описания: внутренняя youtu.be кликается
  без верификации, внешняя на лендинг сидит под время-гейтом → дублируем закрепом.
- Not made for kids, Public.
- Закреп писать на обычном youtube.com, а не в Studio → Комментарии (там чужие, свои не видны,
  так уже наплодили дубль 26.08).

## Раскадровка (15.0с, тайминги подогнаны под голос по словам Groq STT)
| Время | План (исходник) | Титр сверху | Титр снизу |
|---|---|---|---|
| 0.00-3.90 | курсор таскает картинку вместо выделения (3.75) | This text is an IMAGE | you cannot select it |
| 3.90-6.10 | меню Extensions со списком (10.60) | Extract Text from Image | free Chrome extension |
| 6.10-7.35 | попап крупно, Start selection (13.60) | Hit Start selection | |
| 7.35-8.60 | зелёная рамка поверх слайда (18.40) | Drag a box around it | |
| 8.60-9.55 | плашка Recognizing text крупно (21.80) | Two seconds | |
| 9.55-11.70 | панель Extracted Text (25.80) | Every line exact | Copy all or Download |
| 11.70-13.20 | слайд и блокнот рядом (36.00) | From image to real text | |
| 13.20-15.00 | блокнот крупно, текст читается (38.00) | Extract Text from Image | Free for Chrome |

## Голос (Fenrir, 13.53с)
See this text? It is an image. You cannot select it. So use Extract Text from Image.
Hit Start selection and drag a box around it. Two seconds later the text is right there.
Copy it or download it. Free, right in Chrome.

Утечки стиль-промпта нет, проверено прогоном через Groq STT (`groq_words.json`), не на слух.
