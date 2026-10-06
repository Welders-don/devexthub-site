# Convert PDF to Excel 1.1.0: скрины и замер для статьи «PDF to Excel on Mac» (06.10.2026)

Живая версия 1.1.0 (`~/projects/Pdftoexel/releases/Convert-PDF-to-Excel-1.1.0.zip`), распакована в `ext/` (не в git). Только локальный путь (pdf.js в панели), AI-режим не нажимался.

## Картинки
- `assets/blog/pdf-mac-panel.webp`: 1280x800, 37 КБ. Слева PDF во встроенном вьюере Chrome (открыт по http, 880 px), справа настоящая страница панели `sidepanel/index.html` из живого кода (400 px) в состоянии после конвертации: «Converted 1 page(s) into 1 sheet(s), 20 rows total.», «Conversion done», кнопки `Download .xlsx`, `Download .csv`, `Try AI mode · Free preview`, `Convert another`. Две вкладки сняты отдельно и склеены ffmpeg (hstack + разделитель 1 px). Шапки side panel самого Chrome (имя расширения, крестик) в кадре нет: это страница панели во вкладке.
- `assets/blog/pdf-mac-result.webp`: 1280x800, 51 КБ. **Рендер содержимого скачанного файла** `statement-september-2026.xlsx` (ячейки, ширины колонок и жирный стиль взяты из XML файла), нарисован HTML-сеткой в стиле таблицы. Это НЕ скрин Excel и не Numbers. Числа выровнены влево, как Excel показывает текстовые ячейки (см. ниже).
- WebP q80 (`ffmpeg -c:v libwebp -quality 80 -compression_level 6`). Сырые PNG в `raw/` (не в git): ещё есть `mac-panel-loaded.png` (файл выбран, кнопка `Convert to Excel`) и `mac-panel-after-dl.png` (после скачивания, «Did the table come out right? 👍 👎»).
- Снято на Linux (Chromium 145 под Xvfb): шрифты Liberation/DejaVu вместо San Francisco. Вьюер PDF и панель на Mac выглядят так же, отличается только шрифт.

## Тестовый PDF
`statement.pdf` (23 КБ, 1 стр. Letter): вымышленный «Example Community Bank», владелец «Jordan Example», счёт ****0000, 13 операций + строка Opening balance, колонки Date / Description / Amount / Balance, суммы со знаком и разделителем тысяч, итоги под таблицей. Генерируется в `run.js` (HTML → Chromium `page.pdf`).

## Замер (Chromium 145, 2 vCPU VM, без GPU)
- Время = от клика `Convert to Excel` до строки «Converted…» (MutationObserver в панели). 1 страница, 5 прогонов подряд в одной панели: 259 / 277 / 222 / 203 / 202 мс, медиана **0.22 с**. Прошлые прогоны того же скрипта: первый 340-350 мс, остальные 190-360 мс.
- Сверка xlsx с исходными данными (по ячейкам): **13 из 13 строк операций, 52 из 52 ячеек** на своих местах, склеек 0, съездов 0. Заголовок `Date | Description | Amount | Balance` отдельной строкой. Лист один, «Page 1».
- **Все ячейки записаны как текст** (`t="inlineStr"`, 52 из 52). `3,200.00` и `-1,450.00` в Excel будут текстом (зелёные треугольники, SUM даст 0, нужен «Convert to Number»). Причина в коде: `sidepanel/xlsx-writer.js` пишет каждую ячейку `t="inlineStr"`, числового типа нет. Тот же писатель у AI-пути (`aiResultToSheets` → `buildXlsxBlob`).
- Таблица в файле начинается с колонки B (A занята шапкой документа, ширина 60). Шапка над таблицей частично склеена: «Checking account ****0000 Sample document, not a real account» (левый и правый блоки в одну ячейку), «Statement period: … Account activity» (строка реквизитов + заголовок раздела, жирным). Итоги под таблицей: подпись и сумма в одной ячейке («Closing balance: 4,221.79» в C19).
- CSV (`Download .csv`): тот же грид, UTF-8 с BOM, числа с запятыми в кавычках.

## Подписи (en, живой прогон)
Пустая панель: «Drop PDF or Excel here» / «or click to select». Файл выбран: имя и размер, `Convert to Excel`, `Choose another file` (галка «Split pages into separate sheets» скрыта на одностраничном PDF). Во время работы кнопка `Reading PDF…` → `Building Excel…`. Результат: «Conversion done», `Download .xlsx`, `Download .csv`, «Result not great?», `Try AI mode` + `Free preview`, `Convert another`. Файл: `<имя pdf>.xlsx` / `.csv`.

## Что в статье расходится с кодом 1.1.0 (статью не правил)
1. **«Numbers stay real numbers you can sum, not text.»** Неправда: все ячейки текстовые (см. замер), просуммировать без конвертации нельзя. Самое серьёзное расхождение.
2. **«…and open your PDF. Click the extension icon. It finds the table…»** Клик по иконке только открывает панель (`openPanelOnActionClick`); открытый во вкладке PDF панель не читает. Реальный путь: иконка → перетащить PDF в панель или «click to select» → `Convert to Excel` → `Download .xlsx`. Открывать PDF в Chrome не нужно вообще. «One click» тоже неточно: минимум 3 действия + выбор файла.
3. **«rows, columns and totals in the right cells»**: строки и колонки таблицы да (52/52), итоги под таблицей нет: подпись и сумма в одной ячейке.
4. «Download a clean .xlsx or CSV»: верно, обе кнопки есть.
5. «Text-based PDFs are read locally… never has to be uploaded»: верно, pdf.js в панели, файл никуда не уходит. По сети уходит телеметрия на `api.devexthub.com` (имя события, install_id, fingerprint, число страниц), без содержимого файла.
6. «optional AI mode… opt-in»: верно, только по кнопке `Try AI mode` (на скане панель пишет «Scanned PDF» и «Use AI mode — it reads scanned pages.» с меткой Recommended). Статья не говорит, что в AI-режиме файл уходит на сервер и что есть лимиты (по PROJECT.md: 20 стр/документ, 30 стр/сутки, файл до 30 МБ; в клиенте проверяется только 30 МБ).
7. «Going the other way… spreadsheet back into a PDF»: верно, .xlsx → `Convert to PDF` → вкладка «Save as PDF» → печать в PDF через диалог Chrome.
8. Не сказано, но стоит знать: парсер режет таблицу до 6 колонок (`capColumnCount`), широкие отчёты склеиваются.

## Сеть: 0 запросов к api.devexthub.com наружу
- `ctx.route(/api\.devexthub\.com/)` → fulfill 200 пустым телом: перехвачено 14 запросов (1 `/api/install`, 13 `/api/event`: onboarding_open, panel_open, day_open, pinned, file_loaded, first_convert, convert_free ×5, download ×2). Playwright дополнительно отдаёт на каждый `requestfailed net::ERR_ABORTED` (14 дублей), это артефакт перехвата, не сеть.
- Страховка `--host-resolver-rules=MAP api.devexthub.com ~NOTFOUND` + net-log Chrome (`raw/netlog.json`): события с api.devexthub.com только `CORS_REQUEST` (14), **DNS-резолвов 0, сокетов к api.devexthub.com 0**. Все удалённые адреса сокетов: 127.0.0.1 (наш http.server) и адреса Google (сервисы самого Chrome). 87.106.208.215 в логе встречается только как `local_address` (скрипт шёл на самом VPS), не как адрес назначения.
- AI-эндпоинт `/api/convert` не вызывался.

## Как прогнать
```
cd ~/projects/Devexthub-site/releases/blog-mac-shots
python3 -c "import zipfile;zipfile.ZipFile('/home/client/projects/Pdftoexel/releases/Convert-PDF-to-Excel-1.1.0.zip').extractall('ext')"
mkdir -p ~/projects/Devexthub-site/.shots/chrome-home-pdfx
xvfb-run -a -s "-screen 0 1400x1000x24" node run.js
```
`run.js` (в папке, не в git) сам: генерирует `statement.pdf`, поднимает `python3 -m http.server` на свободном порту и гасит его в `finally`, ставит расширение в свежий профиль `.shots/pdfx-mac-profile-*`, делает 5 конвертаций, скачивает xlsx и csv, сверяет ячейки, рисует рендер, склеивает кадры, пишет `raw/results.json` и проверяет net-log.
