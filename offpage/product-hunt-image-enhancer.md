# Product Hunt — Image Enhancer (пакет полей, ДАТА НЕ НАЗНАЧЕНА)

Продукт: Chrome extension, локальный AI-апскейл (Real-ESRGAN general x4v3, WebGPU→wasm)
Лендинг: https://www.devexthub.com/image-enhancer/?utm_source=producthunt&utm_medium=launch&utm_campaign=ph_imageenhancer
CWS: https://chromewebstore.google.com/detail/image-enhancer/pkkccllbjokjgkffmjcjigfajhojjlmi
Аккаунт запуска: прогретый ЛИЧНЫЙ аккаунт Дениса @welders_don (solo maker = Hunter+Maker).
День: ПЯТНИЦА (PRODUCT-HUNT-RULES.md). Ближайшие: 28.08 · 04.09.

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

## Tagline (47/60)
Upscale low-res images 4x right in your browser

Запасные:
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

## Галерея 1270x760 (СТАТУС: НЕ собрана)
Главный слайд — before/after на МАЛЕНЬКОЙ ЦИФРОВОЙ картинке, не на старом скане.
Готовый материал замера: `Imageenhancer/releases/analog-test/A-digital-jpeg-in.png` / `-out.png`.
План слайдов:
1. before/after: миниатюра → 4x (главный)
2. сценарий «товарное фото не проходит по размеру» → после
3. карточка «runs in your browser, nothing uploaded»
4. карточка «free, no sign-up, no watermark»
Ассеты: assets/ie-screenshot-ui.png, assets/ie-upscale-demo.png, assets/image-enhancer-icon-128.png
(⚠️ assets/ie-sample.jpg — сырой демо-исходник, В ГАЛЕРЕЮ НЕ БРАТЬ). Нужен thumbnail 240x240.

## Shoutouts
Claude (alt Cursor), GitHub (alt GitLab). Pricing Free, Bootstrapped — как на ET-лонче.

## ОТКРЫТО (за Денисом)
1. Решение по дате — см. риск ниже.
2. Вычитка first maker-коммента.
3. Рендер галереи.

## РИСК ПО ДАТЕ (мнение Пафнутия, 25.08)
Против 28.08: лендинг и CWS-описание ВСЁ ЕЩЁ обещают «улучшить что угодно». Лонч приведёт людей
на карточку, которая обещает не то → тот же отток, но публично и навсегда под постом. Выстрел
одноразовый (в ledger по PDF/TVT прямо «НЕ перезапускать»), сожжём network от трёх лончей.
Плюс продукт в паузе до ~31.08 (копим чистую органику после отключения Google Ads 23.08),
v1.0.6 ждёт аппрува.

Предложение: сперва переписать лендинг + CWS-описание под upscale-позиционирование (текст, не
код), потом лонч 04.09 или позже.
