# Umami devexthub, срез 05.10.2026 (данные 31.08-05.10 03:05 UTC)

БД umami-db-1, website 9cd8ea39. Сессии = distinct session_id по pageview. IP Дениса не исключён (CN 0-4 сессии/нед).

## Сессии по неделям (пн)
| неделя | /app/ (кабинет) | остальной сайт |
|---|---|---|
| 31.08 | 0 | 24 |
| 07.09 | 0 | 22 |
| 14.09 | 3 | 37 |
| 21.09 | 120 | 70 |
| 28.09 | 122 | 87 |
Сайт без кабинета вырос ~22 → 87/нед за 3 недели. /app/ ~120/нед = пользователи Капитана (саммари), не поисковый трафик.

## С 21.09, не /app/
Страницы: главная 65, /transcribe-video-to-text/ 57, /extract-text-from-image/ 23, /pdf-to-excel/ 22, /image-enhancer/ 12, MOV 4.
Рефереры: прямой 133, chromewebstore 24, google 10, facebook 5, bing/ddg 4, youtube.com 2, uno 1, producthunt 1, gemini 1.
UTM: YouTube всех роликов ~17 сессий (tvt_long3 6, pdf 4, et 2, ie 2, tr_long2 1), producthunt 4, chatgpt.com 4, Fazier 3, Uno 2, outreach 0.
Страны: US 51, BR 16, IN 15, SG 10, HK 6, CN 5, CA 5.
События: app-xpromo 5 кликов.

## Интерпретация
Прямые заходы без query на лендинги (TVT 41, главная 39) = источник неизвестен; Расширения (Capitan, ET, PDF, IE) на лендинги НЕ ссылаются, только /app и privacy, так что это не они. Вероятно стор (ссылка на сайт в карточке) или ручной ввод и мессенджеры, НЕ ПРОВЕРЕНО.
Google даёт ~10 сессий за 2 недели, сходится с GSC (4 клика/нед).

## 05.10 событие store-click (fbbaad2, live)
Все 97 ссылок на карточки стора (42 файла) размечены `data-umami-event="store-click"` + `data-umami-event-ext` (transcribe / extract-text / pdf-to-excel / image-enhancer / convert-mov). Страница = url события.
Проверено в Lightpanda на живом /pdf-to-excel/: трекер шлёт `name:"store-click", data:{ext:"pdf-to-excel"}`, потом уводит в стор (fetch застаблен, событие в БД не писалось; 1 тестовый pageview DE ~03:3x UTC лёг).
Сверка с GA4 карточек: в ссылках уже стоит utm_source=devexthub_landing → это и есть «devexthub» в GA4 (у Capitan 15 сессий за 29.06-26.09). store-click в Umami vs devexthub_landing в GA4 за одни даты = потеря счётчика.
Попутно: кнопка «Get the extension» в /app/ с 18.09 вела на чужой пустой ID gkbpjh… (стор «empty-title»), исправлено на mgblgaahjeahphiahfakjiabnheanbhj.
