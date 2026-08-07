# Handoff — Devexthub site

## СЕССИЯ 2026-08-07 (продолжение) — Product Hunt лонч Extract Text from Image
### Где остановились
Полностью настроили и ЗАПЛАНИРОВАЛИ лонч Extract Text на PH. Ждём старта.

### Лонч — факты
- Дата/время: **Fri Aug 7, 12:01 AM PT = 15:01 Китая**, полное 24-ч окно. post_id=**1216993**, slug **extract-text-from-image**.
- Ссылка лонча: https://www.producthunt.com/products/extract-text-from-image
- Аккаунт: **Denis @welders_don**, solo maker ("I worked on this product" = Hunter+Maker).
- Product URL в карточке = лендинг https://www.devexthub.com/extract-text-from-image/ (+UTM).
- Tagline: "Copy text from any image or screenshot in one click". Description — meta-строка лендинга (оставили).
- Галерея: **видео** (слот 1, Денис залил ФАЙЛОМ — YouTube-ссылку PH отверг invalid) + 3 карточки 2540x1520 + thumbnail-240.png. Всё в `releases/ph-extracttext/` (card-1-photo, card-2-select, card-3-private; сборка src/build_cards.py → chrome-headless-shell).
- Shoutouts: Claude (alt Cursor), GitHub (alt GitLab). Pricing Free, Bootstrapped, team 1.
- Featured-badge (light) вшит в hero лендинга (commit ae755c5), post-embed карточка в блог how-to-extract-text-from-a-picture (33df7b8), статус в offpage (cfa42f2). Всё запушено в main, live.

### Следующий шаг
- **Таймер `ph-vote-collect-extracttext` сработает в 15:10 Китая (07:10 UTC)** — я проверю что лонч поднялся и дам Денису 2 готовых текста: (1) LinkedIn-сообщение людям за кого голосовал раньше (ответная услуга), (2) текст для Telegram-чата взаимных голосований. Оба — копипаст-блоки, без тире/хайпа.
- После суток: зафиксировать позицию. Топ дня → разблокируется social-proof badge (доп. плашка на сайт).

### Контекст / грабли
- Первую версию галереи (2 сырых кадра одной сцены) Денис забраковал — переделал на дизайн-карточки бренда с РАЗНЫМИ сценами. Урок: не лепить одинаковое.
- Рендер карточек: только chrome-headless-shell (полный chrome падает SIGTRAP), профиль в /tmp, --allow-file-access-from-files для локальных картинок.
- Детали лонча продублированы в `offpage/product-hunt-extract-text.md` и `memory/2026-08-07.md`.

## Параллельно (не трогали сегодня, из прошлой сессии)
- Бренд-знак Devexthub — ждёт выбора Дениса (рекомендация E). См. `_preview/logo-hub-v2.html`, PROJECT.md.
