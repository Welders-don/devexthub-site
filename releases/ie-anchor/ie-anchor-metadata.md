# Handoff — Image Enhancer YouTube (2026-08-13)

## Где остановились
Якорный лонг СОБРАН и ЗАЛИТ на YouTube. Осталось нарезать 3 вертикальных шорта по режимам — начал, но не доделал (споткнулся на генерации голосов).

## Что сделано
- Якорный ролик готов: `releases/ie-anchor/ie-anchor-final.mp4` (24.7с, 1080p, озвучка Gemini TTS + выжженные пословные сабы + loudnorm −14 LUFS + иконка расширения на карточках интро/аутро).
- ЗАЛИТ: https://youtu.be/QtE2CfgRJHo (Public, канал @NicholaChaus). НЕ перезаливать (решение Дениса 13.08).
- Пайплайн сборки лонга: `releases/ie-anchor/build_ie_anchor.sh` (карточки+сегменты+титры), голос `voice.wav`, сабы `subs.srt`, иконка `icon.png` (= Imageenhancer/extension/icons/icon128.png, синий sparkle).
- Карта проекта поправлена: лендинг ЕСТЬ (был записан как «нет»).

## Следующий шаг (ШОРТЫ)
Нарезать 3 вертикальных (1080x1920) шорта из `releases/ie-anchor/src7.mp4` — по одному режиму:
- Шорт A — Enhance (кофе, src7 0.4-3.0, растянуть)
- Шорт B — Upscale 4x (девушка, src7 32-40)
- Шорт C — Unblur (водопад, src7 68-74)
Каждый ~10-15с: бренд-фон, хук сверху, экранка before/after по центру (scale 1080 wide → 1080x607), иконка+CTA снизу в SAFE-ZONE (baseline не ниже y≈1340, иначе уедет под UI Shorts), свой короткий голос + пословные сабы + loudnorm −14 LUFS.
Голос-тексты (готовы, в этом файле ниже). Аутро/CTA шортов → URL ЛЕНДИНГА, не CWS.

### ГРАБЛЯ на которой остановились
Пытался сгенерить 3 голоса одной bash-петлёй с `python3 -c "..."` инлайн — сломалось на экранировании кавычек/скобок (SyntaxError, `-d @файл` не создался). ФИКС: писать python в heredoc-файл (`python3 <<'PY'`), НЕ инлайн `-c` с вложенными кавычками. Рабочий образец генерации голоса — в `build`-истории лонга выше по сессии (curl gemini-2.5-flash-preview-tts → base64 inlineData.data → PCM s16le 24000 mono → ffmpeg wav).

### Ключи/грабли (проверено в этой сессии)
- Gemini TTS: model `gemini-2.5-flash-preview-tts`, voice `Puck`, ответ = inlineData PCM L16 24000. Ключ `$GEMINI_API_KEY` рабочий.
- Deepgram word-level (для сабов): рабочий ключ `$DEEPGRAM_API_KEY_VIDEO_CWS` (основной `$DEEPGRAM_API_KEY` даёт INVALID_AUTH!). Endpoint /v1/listen?model=nova-2&smart_format=true&punctuate=true, header `Authorization: Token`.
- drawtext НЕ терпит `%` в тексте (Stray %). Символ `&` в force_style сабов ок.
- Fontconfig «No writable cache» при subtitles — не фатально, шрифт DejaVu Sans подхватывается.
- rm -rf блокируется песочницей (RED) — работать без него.

## Голос-тексты шортов (upbeat, energetic Puck)
- enhance: "Blurry, noisy photo? Image Enhancer cleans it up right in Chrome. One click, noise gone, details sharp. Free, and it never leaves your device."
- upscale: "Tiny, low res image? Image Enhancer upscales it up to four times, right in Chrome. Crisp and high res in one click. Free, fully on your device."
- unblur: "Out of focus shot? Image Enhancer brings the edges back, right in Chrome. Sharp in one click. Free, and nothing leaves your device."

## Метаданные лонга (для описания залитого ролика — вставить Денису)
Title: Free AI Image Upscaler & Unblur in Chrome — Images Never Leave Your Device
Description: см. ниже. Ссылка = www.devexthub.com/image-enhancer/ (ЛЕНДИНГ, не CWS).
Закреп-коммент (кликабельная ссылка): https://www.devexthub.com/image-enhancer/?utm_source=youtube&utm_medium=video&utm_campaign=imageenhancer&utm_content=ie_long1
ВАЖНО: ссылка в описании некликабельна (время-гейт канала) → закрепить коммент со ссылкой.

Description для вставки:
Turn blurry, low-res photos into sharp, high-res images right inside Chrome. Image Enhancer runs a real AI model 100% on your device — your images never leave your computer. Free, no sign-up, no watermark.
Enhance — remove noise and JPEG artifacts
Upscale 2x / 4x — increase resolution
Unblur — sharpen out-of-focus shots
Get it: https://www.devexthub.com/image-enhancer/?utm_source=youtube&utm_medium=video&utm_campaign=imageenhancer&utm_content=ie_long1
#imageenhancer #upscale #aiupscaler #unblur #chromeextension #photoediting

## Формат/техники шортов (из workspace/knowledge/shorts-video-use-techniques.md)
- Safe-zone нижнего текста: baseline не ниже y≈1340 (нижние 30% закрыты UI Shorts/TikTok).
- Пословные сабы: 2 слова заглавными, force_style FontName=DejaVu Sans, Alignment=2, MarginV большой.
- loudnorm two-pass −14 LUFS: `releases/shorts/loudnorm_voice.sh in out`.
- Дрип шортов враздрай, не все в один день (как ET).
