# Product Hunt — Image Enhancer (пакет полей, ЗАПУСК ПТ 28.08.2026)

Продукт: Chrome extension, локальный AI-апскейл (Real-ESRGAN general x4v3, WebGPU→wasm)
Лендинг: https://www.devexthub.com/image-enhancer/?utm_source=producthunt&utm_medium=launch&utm_campaign=ph_imageenhancer
CWS: https://chromewebstore.google.com/detail/image-enhancer/pkkccllbjokjgkffmjcjigfajhojjlmi
Аккаунт запуска: прогретый ЛИЧНЫЙ аккаунт Дениса @welders_don (solo maker = Hunter+Maker).
День: ПЯТНИЦА (PRODUCT-HUNT-RULES.md). **ДАТА НАЗНАЧЕНА ДЕНИСОМ 26.08 → пятница 28.08.2026.**
Риск по дате, который я поднимал 25.08, снят наполовину: лендинг вычищен 25.08 (коммит 828c30d
в Devexthub-site), v1.0.6 в CWS live. ОСТАЁТСЯ: CWS-описание не переписано (решение 25.08 не
трогать до следующей заливки) — с PH человек уйдёт на чистый лендинг, но по кнопке Install
попадёт в карточку со старыми формулировками. Плюс лонч ломает чистоту замера органики после
отключения Google Ads 23.08: органику считать по 27.08 включительно, дальше разрыв.

## 🔴 ПОЗИЦИОНИРОВАНИЕ — читать до правки любых текстов
Зона продукта задана ЗАМЕРОМ, не догадкой: `Imageenhancer/knowledge/model-limits-analog-vs-digital.md`.
Резкость до/после на одном фото, три вида порчи:
- цифра (ужато + JPEG q30) → **x4.07** ✅
- аналог, оптический расфокус → x1.31 ❌
- аналог, зерно плёнки → **x0.11** ❌ (модель стирает фактуру, фото становится пластиковым)

**ПРОДУКТ = увеличить маленькую ЦИФРОВУЮ картинку.** Миниатюры, товарные фото под требования
маркетплейса, аватарки, картинки из мессенджеров и с веба, пережатые скриншоты.

ЗАПРЕЩЁННЫЕ обещания (модель их не выполняет):
- «restore old photos», «фото с плёнки», «фотография бабушки» — аналог не тянет, замер B/C
- «улучшить любое фото» — хорошее современное фото улучшать нечем, это корень оттока (19.08)
- remove background, colorize, реставрация лиц

История: 25.08 Пафнутий предложил развернуть питч в «restore старых фото» — Денис отверг сразу
(«у аналоговой фотографии нет цифровых следов, цепляться не за что»), замер подтвердил численно.

## Name
Image Enhancer

## Tagline (47/60) — ВЫБРАН 26.08
Upscale low-res images 4x right in your browser

Запасные (не пошли):
- Make small images big without turning them to mush (50)
- Enlarge thumbnails and product photos 4x, no upload (51)

## Description (PH-короткая)
Image Enhancer takes small, low-resolution images and enlarges them up to 4x without the usual
mush. Thumbnails, product shots that are too small for a marketplace listing, avatars, images
saved from chats or the web, over-compressed screenshots. The AI model runs entirely inside your
browser, so nothing is uploaded anywhere. Free, no account, no watermark.

## Topics (3)
Photo Editing · Chrome Extensions · Design Tools

## Links
- Website: лендинг (UTM выше)
- Also available on: Chrome Web Store (CWS-ссылка)

## First maker comment (от лица Дениса — ВЫЧИТАТЬ, звучит ли его словами)
Hey Product Hunt

This started with a boring problem. I had product images that were too small for the listing
requirements, and every upscaler I tried wanted an upload, an account, or stamped a watermark on
the result.

So I built Image Enhancer. It runs the AI model inside your browser, on your own machine. Nothing
is uploaded anywhere, and once the model is cached it works offline.

Two honest notes, because I would rather you install it for the right reason:

It works on small digital images. Thumbnails, product photos, avatars, pictures saved from chats,
screenshots that got compressed into mush. I measured it against a plain resize of the same file,
and the result comes out about twice as sharp.

It will not fix a scanned film photo or an out-of-focus shot. I measured that too, and the gain
was almost nothing. There is no detail left in those files to recover, and anything that claims
otherwise is inventing pixels. Different problem, different model.

Free, no sign-up, no watermark. If you have a tiny image you need bigger, that is the one to try.

## Цифры, которые можно называть публично (замер 26.08, `spike/measure-gallery-pair.mjs`)
На паре ИЗ ГАЛЕРЕИ (400×267 → 1600×1068), variance of Laplacian, выход нормализован к входу:
- резкость входа 817.8 · выход модели 1050.6 (**x1.28** к входу) · bicubic-ресайз 492.8 (x0.60)
- **модель против простого ресайза = x2.13** ← ЭТУ цифру можно называть

🔴 **«x4 резкости» из `analog-vs-digital.mjs` НА PH НЕ НАЗЫВАТЬ.** Она получена на кейсе A
(256×256, JPEG q30) и относится к другой картинке. Ловушка метрики: чем сильнее убит вход, тем
ниже база и тем КРАСИВЕЕ множитель, при этом выход визуально хуже (восковый). Цифра и картинка
должны быть с одного файла. «4x» в тэглайне = про РАЗМЕР (апскейл), это корректно.

## Честность (что НЕ обещать)
- НЕ делает: аналог/плёнку, расфокус, remove background, colorize, face restore.
- Вход ≤4 МП; крупнее ужимается перед обработкой (app.js:239) — юзер получит файл меньше
  оригинала. ⚠️ ЖИВОЙ ХВОСТ, про размер на PH не обещать ничего.
- Скорость: ~2 мин на WebGPU, 8+ мин на wasm-фолбэке. Не заявлять «instant».

## Галерея 1270x760 (СТАТУС: СОБРАНА 26.08)
Файлы: `Imageenhancer/releases/ph-gallery/` (коммит 0d98a9b), рендер-скрипт `spike/gallery-ph.mjs`
(headless chrome CDP :9222, пересобрать = `node spike/gallery-ph.mjs` из корня Imageenhancer).
1. `ph-1-before-after.png` — реальный before/after, ОДИН И ТОТ ЖЕ кроп-регион в обеих панелях
2. `ph-2-scale.png` — что значит 4x: вложенный кадр ровно 1/4 линейного размера + 4 сценария
3. `ph-3-on-device.png` — ничего не грузится + честно про «пара минут на картинку»
4. `ph-4-free.png` — free / no sign-up / no watermark + стек модели
Thumbnail: `ph-thumbnail-240.png`.

⚠️ **Материал замера A-digital-jpeg (256×256, JPEG q30) в галерею НЕ ГОДИТСЯ** — проверено
глазами 26.08. Метрика x4.07 честная, но визуально выход восковый: модель стирает фактуру и
дорисовывает. Метрика меряет градиенты, зритель видит пластик. Взят `testdata/degraded_squirrel.jpg`
(400×267) → `testdata/enhanced_squirrel_check.jpg` (1600×1068): умеренно ужатый исходник, реальный
прогон, кромки и складки читаются. ВЫВОД ДЛЯ БУДУЩИХ ПРОМО: демо-материал = умеренно ужатое,
НЕ убитое в хлам.

⚠️ `assets/ie-screenshot-ui.png` В ГАЛЕРЕЮ НЕ БРАТЬ: демо на еже мыльное И виден блок
«Cloud AI / Face Restore (Soon)» — облачный режим не реализован (этап 5), face restore в
запрещённых обещаниях. `assets/ie-sample.jpg` — сырой исходник, тоже не брать.
`assets/ie-upscale-demo.png` — before там симулирован CSS-блюром, для PH не годится.

## Shoutouts
Claude (alt Cursor), GitHub (alt GitLab). Pricing Free, Bootstrapped — как на ET-лонче.

## СТАТУС: ЗАПЛАНИРОВАН (26.08, форма заполнена и submit сделан Денисом)
Лонч стоит в расписании PH на **пятницу 28.08.2026**, старт 00:01 PT = **15:01 по Китаю**.
1. ~~Решение по дате~~ → 28.08.
2. ~~Вычитка first maker-коммента~~ → Денис принял мой текст БЕЗ правок, вставлен как есть.
3. ~~Рендер галереи~~ → собрана и загружена.

Что ушло в форму (отличия от черновика выше):
- Description: лимит поля оказался **500**, а не 260 → ушла ПОЛНАЯ версия (359 символов).
  Изначально в поле был вписан старый текст «Fix blurry, low quality photos» (запрещённое
  обещание, расфокус модель не чинит) — заменён.
- Links: первой стоит ЛЕНДИНГ с UTM, CWS вторым (трафик ведём на свой домен).
- «Is this an open source project?» — НЕ отмечено (open-source там модель, не код расширения).
- X account — пропущен, отдельного аккаунта под продукт нет.
- Shoutouts (3): Claude (alt Cursor) · GitHub (alt GitLab) · **VS Code** (ONNX Runtime в поиске
  PH не нашёлся). Тексты note по 20+ символов — в истории диалога 26.08.
- Makers: solo (Денис = Hunter + Maker).
- Extras и Connect with Investors — пропущены.

⚠️ **ПРИНЯТЫЙ РИСК (решение Дениса 26.08):** в Video/Loom оставлен СТАРЫЙ ролик по IE, снятый до
чистки позиционирования — он может обещать «улучшить любое фото». Денис решил не трогать.
Если под постом прилетит претензия по этому расхождению, причина известна.

## ДЕНЬ ЛОНЧА 28.08.2026 — факты
🔗 **URL поста (был не записан, найден 28.08 через профиль @welders_don):**
https://www.producthunt.com/products/image-enhancer-2
Слаг `image-enhancer` БЕЗ суффикса занят чужим продуктом (Dresma), не путать. Страница
лончей: `/products/image-enhancer-2/launches`.

Срез ~17:40 по Китаю (≈2.5 часа после старта 15:01):
- апвоутов **1**, комментариев кроме мейкерского **0**
- первый maker-comment на месте (опубликован при сабмите 26.08)

⚠️ В LinkedIn в 15:33 прилетел **Rahul Kumar** («Product Hunter | AI & Marketing Consultant»):
«came across your product on PH and **supported your launch**… помогу попасть в топ-3, два
продукта довёл до #1, let's collab». Продавец апвоутов. При этом счётчик = 1, то есть
«я вас поддержал» — неправда, шаблонная рассылка по свежим лончам. Покупка/обмен голосами =
прямое нарушение правил PH, санкция — снятие продукта с рейтинга дня. Решение: игнор.

## История решения по дате
25.08 Пафнутий был против 28.08: лендинг и CWS-описание обещали «улучшить что угодно», лонч привёл
бы людей на карточку с чужим обещанием, а выстрел одноразовый (в ledger по PDF/TVT прямо «НЕ
перезапускать»). 25.08 лендинг вычищен, v1.0.6 вышла live → 26.08 Денис назначил 28.08.
Остаточный риск (CWS-описание, разрыв в замере органики) описан в шапке.
