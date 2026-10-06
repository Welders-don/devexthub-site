# Extract Text from Image 1.2.7: скрины и замер для статьи «copy text from an image on PC» (06.10.2026)

Живая версия 1.2.7 (`~/projects/Extracttext/releases/extracttext-1.2.7.zip`), распакована в `ext/` (не в git: 40 МБ, репо публичный).

## Картинки
- `assets/blog/et-pc-select.webp`: 1280x800, 20 КБ. Оверлей выделения поверх чека, подсказка «Draw a selection · ESC to cancel», рамка.
- `assets/blog/et-pc-result.webp`: 1280x800, 39 КБ. Панель «Extracted Text» с распознанным чеком, кнопки.
- WebP q80 из PNG (`ffmpeg -c:v libwebp -quality 80 -compression_level 6`). Сырые PNG в `raw/` (не в git).
- Снято содержимое вкладки (без тулбара Chrome). Шрифт панели на Linux: фолбэк вместо Segoe UI, на Windows будет Segoe UI.
- Тестовая картинка: `receipt.html` → `receipt.png` (640x528, вымышленный магазин, без брендов и личных данных), открыта в Chrome как картинка по http.

## Замер (Chrome for Testing 145, 2 vCPU AMD EPYC VM, 3 ГБ RAM, без GPU, Xvfb)
Время = от отпускания мыши до текста в панели (MutationObserver в странице).

| Прогон | Время |
|---|---|
| Первый OCR после установки (en), 3 свежих профиля | 15.4 / 14.2 / 14.9 с |
| Повтор, движок в памяти (чек) | 3.9 / 4.6 / 3.8 с |
| Повтор, движок в памяти (слайд 1280x720) | 3.3 с |
| Первый OCR после перезапуска браузера (слайд) | 7.0 с |
| Язык Latin, модели нет в кэше: реальная докачка с GitHub (панель показала «Downloading the language model») | 10.8 с |
| Latin повтор | 4.3 с |
| Вкладка Upload File, тот же чек (с клика по файлу) | 4.1 с |

Докачки модели для English НЕТ: в 1.2.7 детектор и английская модель лежат в пакете (`ext/models/`, 12.9 МБ), `BUNDLED_LANGS = { en: true }` в offscreen.js. Первый запуск долгий из-за старта WASM-движка, а не из-за сети. По сети (raw/media.githubusercontent.com) качаются только остальные языки, один раз на язык.

## Точность (посимвольно, Левенштейн по тексту с пробелами, схлопнутыми в один)
- Чек: **0 ошибок из 346 символов, 0 из 66 слов** (все 6 прогонов, en и latin, и через Upload).
- Слайд `assets/sample-slide-text.png`: **1 ошибка из 302 символов, 1 из 50 слов**: `0.7` → `O.7` (ноль как буква O). Стабильно во всех прогонах.
- Порядок строк чека сохранён, колонки таблицы склеены в строку через пробел (`Cotton work gloves, size L 2 $14.98`).

## Подписи кнопок (en, из `_locales/en/messages.json` и прогона)
- Панель результата на странице: заголовок `Extracted Text`, кнопки `+ Add selection`, `Clear`, `Download`, `Copy all`; строка `Wrong language?` + выбор языка. С 3-го OCR внизу `Enjoying Extract Text? Rate us:` со звёздами.
- `Copy all`: в буфере ровно текст панели (проверено чтением clipboard), кнопка меняется на `Copied!`.
- `Download`: файл `extracted-text.txt` (проверено событием download). Подпись кнопки просто `Download`, не «Download .txt».
- Попап: вкладки `Screenshot` / `Upload File`, кнопка `Start selection`; в Upload: `Choose file`, «Drag & drop image here», «or paste an image with Ctrl+V»; после результата `Clear`, `Download`, `Copy all`.
- Флоу: клик по иконке → `Start selection` → протянуть рамку. Автоматического OCR по клику на иконку нет, автокопирования в буфер нет (только по `Copy all`).

## Где не работает (popup.js `isRestrictedUrl`)
- Выделение заблокировано на URL `chrome:`, `chrome-extension:`, `edge:`, `about:`, `view-source:`, `devtools:`, `data:`, **`file:`** и в Chrome Web Store (`chromewebstore.google.com`, `chrome.google.com/webstore`). Попап выключает `Start selection`, пишет «This page doesn’t support screen selection…» и переключает на Upload File.
- **file://**: картинка, перетащенная в Chrome с диска, выделением НЕ читается, независимо от «Allow access to file URLs» (проверка в попапе по схеме URL, права `file` в манифесте не нужны и не помогают). Локальный файл читается через Upload File (выбор, drag-drop, Ctrl+V).
- **PDF-вьюер Chrome** (PDF по http/https): работает, проверено прогоном: оверлей встал, панель с текстом показалась поверх вьюера (`raw/pdf-result-2.png`). PDF с диска (file://) заблокирован по той же причине, что и картинки.

## Что в статье расходится с продуктом
- «Open the image in your browser, or open a screenshot you just took» + «Click the extension. It runs OCR»: скриншот с диска открывается как file://, там выделение заблокировано. Правда: открыть попап → Upload File (или Ctrl+V прямо в попап). И «клик = OCR» неточно: нужен `Start selection` и рамка.
- Chromebook-абзац «open it in the browser, and run the extension on it»: то же самое, file://.
- «Copy all … or download it as a .txt file»: верно (кнопка `Download`, файл .txt).
- «The OCR runs on your device»: верно по коду (ONNX Runtime WASM в offscreen-документе). По сети уходит только анонимная статистика (uuid, версия, язык UI, имя события), картинка и текст не уходят.

## Замечено попутно
- Если запустить новое выделение из попапа, пока открыта старая панель, снимок экрана делается с панелью (`START_SELECTION` → `captureVisibleTab` сразу), и рамка поверх панели даёт мусор вперемешку с текстом (в черновом прогоне 85 ошибок на 50 слов). Через `+ Add selection` такого нет: панель убирается до снимка.
- PROJECT.md Extracttext устарел: пишет, что модели качаются при первом запуске; для English в 1.2.7 они в пакете.

## Как прогнать
```
cd ~/projects/Devexthub-site/releases/blog-pc-shots
python3 -c "import zipfile;zipfile.ZipFile('/home/client/projects/Extracttext/releases/extracttext-1.2.7.zip').extractall('ext')"
node render-receipt.js                       # receipt.html -> receipt.png
(cd ~/projects/Devexthub-site && python3 -m http.server 8771 --bind 127.0.0.1 &)
P=$(mktemp -d /tmp/et-blog-profile-XXXX)
xvfb-run -a -s "-screen 0 1400x1000x24" node run.js $P 1   # установка: cold, warm, слайд, Copy/Download, PDF, Upload
xvfb-run -a -s "-screen 0 1400x1000x24" node run.js $P 2   # тот же профиль: рестарт браузера, Latin с докачкой, PDF
xvfb-run -a -s "-screen 0 1400x1000x24" node run.js $(mktemp -d /tmp/et-blog-profile-XXXX) 3  # ещё выборка cold/warm
```
- Полный Chromium без писчего HOME падает на crashpad: в скриптах `HOME=.shots/chrome-home-et` + `--disable-crash-reporter`.
- Телеметрия глушится `--host-resolver-rules=MAP devexthub.com ~NOTFOUND`. Проверено по прод-БД `/opt/extracttext-stats/stats.db`: за время прогонов 0 строк в events/usage/actions/feedback.
- Попап открывается вкладкой `chrome-extension://<id>/popup.html`, оттуда шлётся то же `START_SELECTION {tabId}`, что шлёт кнопка `Start selection`; рамка тянется настоящей мышью Playwright.
- Результаты по прогонам: `raw/results-session*.json`.
