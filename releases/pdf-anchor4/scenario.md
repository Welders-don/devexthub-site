# PDF-to-Excel — заход №4 (лонг + шорт), угол: pdf to csv

Формат как pdf-anchor3: лонг ~28-30с 1920x1080 Puck + сабы Groq; шорт ~12с 1080x1920 Fenrir.
Заставка ~2с и концовка ~3с (store-иконка + «Free on Chrome - devexthub.com», фон 0x0F6B39),
каждый сегмент с `-video_track_timescale 30000`, перед concat сверить time_base.

## Почему этот ключ (выбор 24.09)
Прошлые углы PDF: scanned (02.08, шорт 708) · bank statement (22.08, шорт 311) · smallpdf (07.09, 2-3 просмотра).
CSV на YouTube не трогали ни разу, а кластер самый крупный из достижимых (Semrush US, 01.08,
`knowledge/seo-keywords-pdf-to-excel.md`):
- pdf to csv 3 600 / KD 32 · convert pdf to csv 2 400 / KD 33 · pdf to csv converter 1 900 / KD 28
- how to convert pdf to csv 590 / KD 32 · convert pdf to csv free 320 / KD 29
Ссылка ведёт на /blog/how-to-convert-pdf-to-csv/, это survivor эксперимента слияния 20.09.
Ссылки с YouTube nofollow, замер эксперимента (~середина октября) не ломают, но UTM-визиты
на эту страницу при разборе вычитать.

## Сверено с кодом (pdfx139-src/sidepanel)
Кнопка «Download .csv» (`btn-download-csv`) рядом с Excel, только для PDF. Имя файла =
имя PDF с .csv. UTF-8 с BOM (Excel открывает кириллицу/символы нормально), запятые в полях
экранируются кавычками. Несколько листов = в одном CSV через заголовок листа.
НЕ обещать: выбор разделителя, Google Sheets напрямую (только импорт файла).

## Угол
Боль: копируешь таблицу из PDF, вставляешь в таблицу, и всё падает в ОДНУ колонку.
Решение: расширение, Convert, «Download .csv», файл открывается ровными колонками.

## Футаж от Дениса (блокер, 2 куска, 1080p, без личных данных на экране)
1. «Их» ~8с: открыть bank-statement-sample.pdf в Chrome → выделить таблицу → Ctrl+C →
   вставить в Google Sheets (или Excel) → видно, что всё слиплось в столбец A.
2. «Наш» ~15с: иконка → панель → дроп того же PDF → Convert → «Download .csv» →
   открыть скачанный CSV (Sheets: File → Import, или двойной клик в Excel) → ровные колонки.
Тот же документ в обоих кусках, как в заходах #2 и #3.

## VO лонга (~28с, Puck)
"Copy a table out of a PDF, paste it into a spreadsheet, and every row lands in one messy
column. Here's the free way to convert a PDF to CSV. Click the icon, drop the PDF, hit
convert, then Download CSV. Every value in its own cell, ready for Excel, Google Sheets or
any import. It runs right in your browser, no upload and no account. Free in Chrome."

## Раскадровка лонга
- 0-2с заставка
- 2-9с ХУК: копипаст → одна колонка. Плашка: ONE COLUMN MESS
- 9-22с наш демо: иконка → дроп → Convert → Download .csv. Плашки: PDF TO CSV · NO UPLOAD
- 22-26с открытый CSV, ровные колонки. Плашка: EVERY VALUE IN ITS CELL
- 26-29с концовка

## VO шорта (~12с, Fenrir)
"PDF table pasted into one column? Drop the PDF here, hit convert, download CSV.
Clean columns. Free in Chrome."

## Зависимости
- [ ] Футаж 1 и 2 от Дениса → src/
- [ ] Озвучка Puck (лонг) и Fenrir (шорт), стиль одной фразой
- [ ] Сабы Groq STT, монтаж по build_pdf_anchor3.sh
- [ ] Строка в offpage/VIDEO-LEDGER.md тем же коммитом, что закрытие захода
