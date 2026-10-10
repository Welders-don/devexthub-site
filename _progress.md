# Страница-инструмент «Bank statement to Excel» (10.10, ✔ Дениса)

Ветка: agent/bank-statement-tool (от origin/main). URL: /pdf-to-excel/bank-statement/
Критерий приёмки: страница в индексе GSC через 4 недели (~07.11). Не должно упасть: store-click pdf-to-excel с /pdf-to-excel/ (Umami).
Движок = копия Pdftoexel 1.1.1 (pdf-to-tables.js, xlsx-writer.js, csv-writer.js, pdf.js, jszip) в assets/pdfx/.
Отличие от статьи-эксперимента: тут интент «converter online free», статья = how-to. Со статьи ссылку НЕ ставим (замер 06.10).

- [x] 1. assets/pdfx/ движок + tool.js
- [x] 2. страница (текст по PRODUCT.md: локально, ≤6 колонок, скан → расширение AI)
- [x] 3. ссылка с /pdf-to-excel/ + sitemap
- [x] 4. e2e Chromium: текстовая выписка → xlsx числа, скан → CTA, битый → ошибка, мобильный вьюпорт
- [ ] 5. скрины Денису, push по ✔
- [ ] 6. после выката: GSC запрос индексации (Денис), ссылки: YouTube TToK2n9zb-U описание, 3-5 ответов Reddit/Quora, каталоги free tools
