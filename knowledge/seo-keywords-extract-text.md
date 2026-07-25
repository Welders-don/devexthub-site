# SEO keywords — Extract Text from Image (landing /extract-text-from-image/)

Источник: Semrush Keyword Magic Tool, US, фильтр KD:Possible. Пробивает Денис вручную
(агент в Semrush залогиниться не может). Цель — KD < 40 (высокая проходимость),
голова берётся как H1 даже если KD чуть выше.

## Сид: "extract text from image" (23 фразы, суммарно 15 410/мес, avg KD 37)

| Keyword | Volume | KD |
|---|---|---|
| extract text from image | 9 900 | 44 |
| extract text from images | 1 000 | 36 |
| how to extract text from image | 1 000 | 39 |
| text extraction from image | 720 | 42 |
| extract text from an image | 390 | 37 |
| extracting text from image | 390 | 49 |
| how can i extract text from an image | 390 | 36 |
| extract image from text | 320 | 43 |
| how to extract text from an image | 260 | 37 |
| ocr text extraction from image | 260 | 40 |
| extract text from image pdf | 110 | 37 |
| extract the text from this image | 110 | 31 |
| extract text from this image | 90 | 47 |
| how to extract text from images | 90 | 32 |
| how to extract text from image pdf | 70 | 37 |
| best ai tool to extract text from image | 50 | 31 |
| text extraction from images | 50 | 33 |
| apps that extract text from image | 40 | 33 |
| best ai to extract text from image | 40 | 34 |
| extract text from image tool | 40 | 33 |
| best way to extract text from image | 30 | 35 |
| extract text from images in pdf | 30 | 43 |
| tools to extract text from image | 30 | 32 |

Заметки:
- Голова "extract text from image" KD 44 — берём как H1/title (это ядро), не отказываемся.
- Проходимое тело KD≤40: extract text from images, how to extract text from image(s),
  how can i extract text from an image, ocr text extraction from image, best ai tool /
  tool / tools to extract text from image.
- Вопросные ("how to…", "how can i…") → в summary FAQ дословно.
- PDF-хвосты НЕ берём: расширение читает изображения/скриншоты, не страницы PDF. Не переобещать.

## Ждём от Дениса (следующие сиды)
- image to text / image to text converter (ожидаем крупный объём)
- screenshot to text
- copy text from image
- picture to text / photo to text
- extension-интент: image to text chrome extension, screenshot to text extension, ocr chrome extension

## Сид: "image to text" (232 фразы broad, Total 35 900 — ОБМАНЧИВ, сильно засорён)
ВНИМАНИЕ: broad-match намешал чужую интентку. НЕ наше:
- text→image генераторы AI-арта (firefly, midjourney, stable diffusion, deepai, "text to image generator", prompt)
- редактирование картинки (add text / remove text / edit / put text on image, meme text)
- alt text для картинок (accessibility)
Total 35 900 использовать НЕЛЬЗЯ как объём кластера.

Чистый OCR-интент (image→text) из этого экрана, KD≤40:
| Keyword | Volume | KD |
|---|---|---|
| google keep image to text | 720 | 31 |
| free image to text converter | 480 | 40 |
| canva image to text converter | 480 | 37 |
| how to copy text from image | 390 | 35 (и дубль 37) |
| image to text app | 320 | 33 |
| python ocr image to text | 260 | 33 |
| how to copy text from image using pc | 210 | 32 |
| image to text application | 210 | 36 |

Высокий KD (мимо): how to grab text from image 590·45, google lens image to text 480·42,
google image to text 390·49, how to get text from image 210·44, ai image to text generator pro 590·45.

TODO Денису: перебить "image to text" с Exclude keywords:
text to image, add text, remove text, edit, alt text, put text, generator, prompt, diffusion, firefly, midjourney, meme, onto

## Сид: "screenshot to text" (844 фразы, Total 10 580, avg KD 30 — но засорён)
Мусор: "how to screenshot a text message" / "text messages" (это про скрин переписки, не OCR),
"add text to screenshot" (редактирование), "uncover blacked out / hidden / blurred text" (деобфускация).
Головы жёсткие:
| Keyword | Volume | KD |
|---|---|---|
| screenshot to text | 1 900 | 64 (жёстко) |
| screenshot to text converter | 480 | 64 (жёстко) |
| convert screenshot to text | 210 | 47 |
| screenshots to text | 140 | 49 |
Наше проходимое (KD≤40):
| how to copy text from screenshot | 170 | 27 |
| how to copy text from a screenshot | 170 | 44 (мимо) |
| screenshot to text chrome extension | 30 | n/a (точное попадание) |
| how to copy text from screenshot on chromebook/windows | 40/30 | n/a |

## Сид: "picture to text" (засорён text→picture и add/remove/put text)
Головы жёсткие: picture to text 8 100·KD61, picture to text converter 9 900·KD63,
convert picture to text 2 900·KD54, pictures to text 880·59, picture to text free 590·56.
Наше проходимое (KD≤40):
| Keyword | Volume | KD |
|---|---|---|
| how to copy text from a picture | 720 | 35 |
| how to extract text from a picture | 390 | 34 |
| google translate picture to text | 480 | 44 (мимо) |

## Сид: "ocr chrome" (103 фразы, Total 1 140, avg KD 52) — extension-интент, install-ready
Головы средне-жёсткие (держит Copyfish и др.):
| ocr chrome extension | 140 | 55 |
| chrome ocr / ocr extension chrome | 90 | 52-55 |
Проходимое / целевое:
| best ocr extension for chrome | 50 | 39 (гем: KD<40 + горячий интент) |
| free ocr chrome extension, ocr for chrome, image to text ocr chrome extension | ~20 each | n/a (легко, но крохи) |
Конкурент-бренд в выдаче: Copyfish.

## ИТОГ / СТРАТЕГИЯ (по 4 сидам)
Короткие головы-конвертеры (picture/image/screenshot to text converter, ocr chrome extension) = KD 54-64,
держат старые OCR-сайты + Copyfish. Новым доменом НЕ берём.
Наша адресуемая зона (KD 27-40, ~18K/мес суммарно) = экшн-хвосты:
- extract text from image + тело кластера (KD 32-40) — ЯДРО, уже в H1/title.
- how to copy text from image / picture / screenshot (KD 27-35) — сильнейшие, дословно в FAQ summary.
- how to extract text from a picture (KD 34), how to copy text from image on pc/chromebook (KD 32).
- image to text app (KD 33), google keep image to text (KD 31), free image to text converter (KD 40).
- best ocr extension for chrome (KD 39) — вписать «OCR Chrome extension» в текст + FAQ.
Синонимы гонять равноправно: image / picture / screenshot / photo. Явно назвать продукт «OCR Chrome extension».

## Правки на страницу (план)
1. Title/H1 — оставить "Extract text from image" (ядро), добавить синоним picture/screenshot в подзаголовок.
2. Добавить в FAQ дословные вопросы: "How do I copy text from a picture?", "How to copy text from a screenshot?",
   "Is there an OCR extension for Chrome?", "How to copy text from an image on PC/Chromebook?"
3. Одна H2 или фича назвать "OCR Chrome extension" явно.
4. В тексте фич добавить слово "picture" рядом с image/screenshot/photo.

## Сид: широкий "copy/extract text" (676 фраз, Total 145 270, avg KD 40) — ДЖЕКПОТ
Лучшие находки (наш OCR-интент, KD низкий):
| Keyword | Volume | KD |
|---|---|---|
| copy text from image | 5 400 | 21 |  ← ЛУЧШИЙ: объём почти как head, KD вдвое ниже
| copy text from picture | 2 900 | 34 |
| jpg to text free | 1 900 | 22 |
| png to text | 1 800 | 31 |
| copy image text | 880 | 30 |
| copy text from image extension | 590 | 41 (наш точный тип) |
| retrieve text from image | 590 | 38 |
| scan text from image | 880 | 44 |
| pull text from image | 720 | 44 |

Кластер image→Word (НЕ берём — мы отдаём .txt/копирование, не .docx):
image to word 1900·48, image to word converter 1800·30, convert image to word 1300·37,
picture to word 1000·38, img to word 880·30. Переобещать Word-экспорт нельзя (это фича Video to Text).

СМЕНА АКЦЕНТОВ: "copy text from image" (5400/KD21) поднять почти вровень с "extract text from image".
Вписать в title + подзаголовок + trust. Добавить формат-угол jpg/png to text (принимаем PNG/JPG — честно).
Бренд-имя расширения остаётся "Extract Text from Image" → H1 держим на extract, но copy идёт рядом.
