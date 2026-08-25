# Product Hunt — Image Enhancer (пакет полей, ДАТА НЕ НАЗНАЧЕНА)

Продукт: Chrome extension, локальный AI-апскейл/расшумление фото (Real-ESRGAN general x4v3, WebGPU→wasm)
Лендинг: https://www.devexthub.com/image-enhancer/?utm_source=producthunt&utm_medium=launch&utm_campaign=ph_imageenhancer
CWS: https://chromewebstore.google.com/detail/image-enhancer/pkkccllbjokjgkffmjcjigfajhojjlmi
Аккаунт запуска: прогретый ЛИЧНЫЙ аккаунт Дениса @welders_don (solo maker = Hunter+Maker).
День: ПЯТНИЦА (PRODUCT-HUNT-RULES.md). Ближайшие: 28.08 · 04.09.

## 🔴 ГЛАВНОЕ ПЕРЕД ЗАПУСКОМ — позиционирование, а не тексты
Известный корень оттока (разбор 24.08, Imageenhancer/_handoff.md): продукт обещает «улучшить
что угодно» и первым делом получает НОРМАЛЬНЫЕ телефонные фото, где улучшать нечего.
Real-ESRGAN general x4v3 восстанавливает УБИТОЕ: мелкое, пережатое, размытое, старое.
Юзер с хорошим снимком ждёт две минуты, не видит разницы, сносит. Денис прошёл сам: «я бы снёс».

Для PH это не мелочь: лонч одноразовый, перезапустить нельзя (в ledger по PDF/TVT прямо «НЕ
перезапускать»), а комментарии «не вижу разницы» останутся под постом навсегда и сожгут
network, который копили тремя лончами.

→ Поэтому весь пакет ниже написан как **restore старых/убитых фото**, а НЕ как «AI enhancer».
Правильная аудитория отсекается на входе, до установки. Это же черновик того, как надо
переписать лендинг и CWS-описание.

## Name
Image Enhancer

## Tagline (51/60)
Unblur and upscale old photos without uploading them

Запасные:
- Fix old, small and blurry photos right in your browser (54)
- Restore pixelated photos locally, no upload, no sign-up (55)

## Description (PH-короткая)
Image Enhancer brings back detail in photos that are already damaged: old scans, small or heavily
compressed images, screenshots that went blurry. The AI model runs entirely in your browser, so
your photos never leave your device. Upscale up to 4x, or just clean up noise and JPEG artifacts.
Free, no account, no watermark.

## Topics (3)
Photo Editing · Chrome Extensions · Design Tools

## Links
- Website: лендинг (UTM выше)
- Also available on: Chrome Web Store (CWS-ссылка)

## First maker comment (от лица Дениса — ВЫЧИТАТЬ, звучит ли его словами)
Hey Product Hunt

I had a folder of old family photos, scanned years ago at a terrible resolution. Every tool I found
wanted an upload, an account, or left a watermark on the result. Sending family photos to someone
else's server to fix them felt wrong.

So I built Image Enhancer. It runs the AI model inside your browser, on your own machine. Nothing
is uploaded anywhere, and it works offline once the model is cached.

One honest thing, because I think it matters more than a feature list: this is for photos that are
already damaged. Old scans, small images, heavy JPEG compression, mild blur. If you feed it a good
photo from a modern phone, you will not see much difference, because there is nothing to recover.
It rebuilds lost detail, it does not invent a better picture.

It is free, there is no sign-up and no watermark. If you have an old photo lying around, that is
the one to try it on. I would love to hear what it did or did not manage to fix.

## Честность (что НЕ обещать)
- НЕ делает: remove background, colorize, реставрацию лиц (face restore), полную реставрацию.
- На хорошем современном фото разницы почти нет — так и написано в maker-комменте.
- Вход ≤4 МП; более крупные ужимаются перед обработкой (app.js:239) — юзер получит файл меньше
  оригинала. ⚠️ ЭТО ЖИВОЙ ХВОСТ, на PH про размер лучше не обещать ничего.
- Скорость: ~2 мин на WebGPU (после фикса NCHW), 8+ мин на wasm-фолбэке. Не заявлять «instant».

## Галерея 1270x760 (СТАТУС: НЕ собрана)
Есть в наличии:
- assets/ie-screenshot-ui.png · assets/ie-upscale-demo.png · assets/image-enhancer-icon-128.png
  (⚠️ assets/ie-sample.jpg — сырой демо-исходник, В ГАЛЕРЕЮ НЕ БРАТЬ, грабля из AlternativeTo)
- Imageenhancer/releases/banners/ — 440x280 промо-баннеры CWS, под PH размер не тот
План слайдов (под новое позиционирование):
1. before/after на СТАРОМ скане (не на хорошем фото) — главный слайд
2. before/after на мелком/пережатом изображении
3. карточка «runs in your browser, nothing uploaded»
4. карточка «free, no sign-up, no watermark»
Нужен thumbnail 240x240 из иконки.

## Shoutouts
Claude (alt Cursor), GitHub (alt GitLab). Pricing Free, Bootstrapped. — как на ET-лонче.

## ОТКРЫТО (за Денисом)
1. **Решение по дате** — см. риск ниже.
2. Вычитка first maker-коммента.
3. Рендер галереи (нужны before/after на реально убитых фото — у Дениса есть старые сканы?).

## РИСК ПО ДАТЕ (мнение Пафнутия, 25.08)
Против запуска 28.08: позиционирование в CWS и на лендинге ВСЁ ЕЩЁ старое («улучшить что
угодно»). Лонч приведёт людей на карточку, которая обещает не то → тот же отток, но публично.
Плюс продукт в режиме ожидания до ~31.08 (копим чистую органику после отключения Google Ads
23.08), и v1.0.6 ещё ждёт аппрува.

Предложение: сперва переписать лендинг + CWS-описание под restore-позиционирование (текст, не
код — день работы), потом лонч 04.09 или позже. Выстрел один, лучше не спешить.
