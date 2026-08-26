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
screenshots that got compressed into mush. I measured it: on that kind of input it recovers about
4x the sharpness.

It will not fix a scanned film photo or an out-of-focus shot. I measured that too, and the gain
was almost nothing. There is no detail left in those files to recover, and anything that claims
otherwise is inventing pixels. Different problem, different model.

Free, no sign-up, no watermark. If you have a tiny image you need bigger, that is the one to try.

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

## ОТКРЫТО (за Денисом) — на 26.08
1. ~~Решение по дате~~ → 28.08, назначено.
2. **Вычитка first maker-коммента** — единственный блокер на Денисе.
3. ~~Рендер галереи~~ → собрана.

## История решения по дате
25.08 Пафнутий был против 28.08: лендинг и CWS-описание обещали «улучшить что угодно», лонч привёл
бы людей на карточку с чужим обещанием, а выстрел одноразовый (в ledger по PDF/TVT прямо «НЕ
перезапускать»). 25.08 лендинг вычищен, v1.0.6 вышла live → 26.08 Денис назначил 28.08.
Остаточный риск (CWS-описание, разрыв в замере органики) описан в шапке.
