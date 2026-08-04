# Рендер скриншотов лендингов (CDP-рецепт, рабочий 04.08.2026)

Одноразовый `chrome --screenshot` в этой песочнице ВИСНЕТ (даже about:blank). Работает только через CDP + playwright-core connectOverCDP. Так сняты все before/after редизайна.

## Поднять Chrome как CDP-сервер
```
export HOME=/home/client/projects/Devexthub-site/.shots/chrome-home   # писчий HOME обязателен, иначе SIGTRAP
CH=/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome
nohup "$CH" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --disable-crash-reporter --disable-breakpad --no-first-run \
  --remote-debugging-port=9222 --user-data-dir="$HOME/cdp" about:blank &
sleep 4; curl -s http://127.0.0.1:9222/json/version   # проверка
```

## Скриптовать скриншот
playwright-core лежит в `/home/client/workspace/tmp/pw/node_modules/playwright-core` (CommonJS → `import pkg from ...; const {chromium}=pkg`).
Рабочие скрипты в `.shots/redesign/`:
- `shot.mjs <fileurl> <out> [width]` — full-page (форсит `.reveal{opacity:1}`).
- `el.mjs <rel> <selector> <out-abs>` — кроп одного элемента (демо-блоки).
- `slices.mjs` — режет страницу на вьюпорт-бэнды со скроллом (для Telegram, где длинная картинка сжимается).
- `tops.mjs` — верх всех 4 продуктовых страниц.

Грабли: clip за пределами вьюпорта падает → для длинных страниц скроллить и снимать по экрану, НЕ clip. Внешний analytics-скрипт (api.devexthub.com:8444) вешает load → goto с `waitUntil:'load',timeout` + `.catch(()=>{})`.

## .shots/ в gitignore — артефакты и chrome-профиль НЕ коммитим.
