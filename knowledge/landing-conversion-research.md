# Ресёрч: что конвертит на лендингах Chrome-расширений / микро-SaaS (2026-08-04)

> Цель: перестроить лендинги devexthub на основе данных, а не «на глаз».
> Контекст: free, no-signup, privacy-sensitive инструменты, мало юзеров, уже есть before/after демо.

## ГЛАВНЫЙ ВЫВОД (что двигать в первую очередь)
1. Интерактивное/«живое» демо продукта над фолдом — самый сильный рычаг. Данные: вовлечённые в демо конвертят 24.35% против 3.05% без демо (×8); интерактив бьёт видео на 12%. 86% топовых демо — это HTML/CSS-каптуры, не статичный скриншот. → У нас УЖЕ есть HTML before/after демо в геро (px-demo) — это правильно, не выбрасывать, а усилить.
2. Один CTA, ноль лишних ссылок. Страницы с одним CTA конвертят 13.5%, с 5+ ссылками — 10.5%. Убрать из шапки лишние навигационные ссылки на конверсионном лендинге, оставить logo слева + «Add to Chrome» справа.
3. Заголовок — конкретика, не категория. Тест специфичности: «могут ли 3 конкурента поставить эту же фразу?». Если да — заголовок мёртв. «All-In-One Sales Platform» → «CRM for Sales Acceleration» дало +94% конверсии.

## HERO / ABOVE THE FOLD (структура)
Над фолдом должно быть ВСЁ для действия:
- Заголовок ≤8 слов (~44 симв). Наш «Stop retyping tables trapped in a PDF» — хороший, ставит боль. Оставить.
- Один подзаголовок в 1 предложение.
- Один основной CTA (+ опц. вторичный). Реальный визуал продукта (скриншот/стилизованный интерфейс), НЕ фичелист, НЕ hero-видео над фолдом.
- Trust-сигналы прямо в геро, не ниже. Для нас (мало юзеров) — не «6-10 логотипов клиентов», а метрики-факты: «~3 sec», «Local parsing, no upload», «No account». Наш trust-strip есть, но стоит ПОД геро — по данным 2026 его тянут ВНУТРЬ геро.

Формула value-prop (Geoffrey Moore, для проверки): «For (кто) who (потребность), our (продукт) is (категория) that (выгода)». Не для текста на странице, а как чек внутренней логики.

Формула заголовка: Фича → что делает → почему важно → эмоц. выгода. How-to заголовки работают (человек сразу понимает что получит).

## CTA — дизайн и размещение
- Прямая кнопка «Add to Chrome» → ведёт прямо на CWS-листинг (у нас так и есть).
- Sticky/floating CTA при скролле (у нас есть .sticky-cta — правильно).
- Убрать конкурирующие ссылки в шапке конверсионной страницы (у нас в nav: All tools / How it works / FAQ + кнопка — «How it works»/«FAQ» это якоря вниз, ок, но «All tools» уводит с лендинга — кандидат на понижение веса).
- Микро-анимация, ведущая внимание к главному CTA.

## SOCIAL PROOF когда юзеров мало
Правило: качество > количество. 2-3 релевантных сигнала бьют стену generic-отзывов.
Что работает без истории продаж:
- Credibility основателя / build-in-public (у нас есть Threads-персона — можно линковать реальные посты).
- UGC: живые твиты/посты пользователей встроенные на страницу (приём Screen Studio — сырые реальные реакции). Как накопим — встроить.
- Trust-бейджи, media mentions, счётчики.
- Live-нотификации визитов создают соц-пруф без данных о продажах.
- Пока UGC нет — НЕ выдумывать фейковые «10k+ / 99.9%» (это AI-slop-тэг и подрывает доверие privacy-инструмента). Держать фактические числа.

## TRUST для privacy-инструментов (наш ключевой рычаг)
Сильнейшая формулировка (взять почти дословно):
«Privacy policy говорит „мы не передадим ваши файлы“. Локальная обработка говорит „мы НЕ МОЖЕМ их передать — мы их не получали“.»
- Local processing — verifiable trust: юзер может открыть Network-таб и убедиться, что аплоада не было. Это сильнее любого бейджа.
- Для инструмента, читающего инвойсы и банковские выписки, приватность = основной оффер, выносить выше.
- Прозрачность permissions: объяснить каждое разрешение человеческим языком (барьер №1 к установке расширения).
- Trust-сигналы поднимают конверсию B2B SaaS на 20-40% в первые секунды.

## ВИЗУАЛ / ТИПОГРАФИКА: почему generic-шаблон не конвертит
- Скриншоты бьют сток-фото в каждом A/B-тесте; интерактив бьёт оба. Показывай продукт, не абстракцию.
- Реальный интерфейс продукта > иллюстрации/иконки-метафоры.
- Убрать «category label» язык и buzzwords («AI-powered», «seamless»), заменить на конкретный outcome («Save 20% of time…»).
- (из redesign-skill, согласуется) системный шрифт + одноцветность + равные 3-колоночные сетки = «шаблонный» вид → менять шрифт (эффект №1), разводить одну краску на нейтрал+акцент, ломать симметрию.

## ПОРЯДОК СЕКЦИЙ (проверенный паттерн)
1. Hero: заголовок + подзаг + CTA + живое демо + trust-факты В геро.
2. Trust-strip (если не влез в геро).
3. Проблема (agitate) — «copy-paste PDF никогда не заканчивается хорошо» (у нас есть, хорошо).
4. How it works — 3 шага.
5. Why people use it — выгоды.
6. Privacy — отдельным сильным блоком (наш дифференциатор).
7. FAQ (снимает возражения: free? upload? scanned?).
8. Финальный CTA-повтор.
(Наш текущий порядок уже почти такой — копирайтинг силён, проблема в подаче/визуале, не в структуре.)

## КОНКРЕТНЫЕ ЦИФРЫ-ОПОРЫ (для аргументации правок)
- Интерактивное демо: 24.35% vs 3.05% (×8), Navattic по 40k+ демо: топ-1% вовлечённость 56%.
- Interactive demo close deals на 23% быстрее (HockeyStack, 24 B2B SaaS).
- Один CTA: 13.5% vs 10.5% при 5+ ссылках.
- Специфичный заголовок: +94% (кейс CRM).
- Trust-сигналы: +20-40% B2B SaaS.
- Демо-видео CWS: 30-90 сек, 1-2 юзкейса, не все фичи.

## ЧТО ЭТО ЗНАЧИТ ДЛЯ НАШЕГО РЕДИЗАЙНА (мостик к правкам)
Сильные стороны оставить: копирайтинг, before/after HTML-демо, privacy-блок, sticky CTA, порядок секций.
Менять (по убыванию эффекта):
1. Втянуть trust-факты В геро (сейчас отдельной полосой под ним).
2. Шрифт: системный → display-шрифт на заголовки + робкий type scale → сильнее.
3. Одноцветный зелёный → нейтрал + один акцент, глубина/иерархия карточек, сломать симметрию 3-колонок.
4. Усилить, а не заменить, живое демо (это наш ×8 рычаг).
5. Privacy: поднять verifiable-формулировку («не можем передать — не получали»).
6. Шапка: понизить вес «All tools», не плодить exit-ссылки.

## Источники
- KlientBoost — 51 High-Converting SaaS Landing Pages: https://www.klientboost.com/landing-pages/saas-landing-page/
- Orbix — SaaS Hero Section Design 2026: https://www.orbix.studio/blogs/saas-hero-section-design
- Spike AI — What Actually Converts 2026: https://getspike.ai/blog/saas-landing-page-best-practices/
- SeedProd — Headline Formulas: https://www.seedprod.com/landing-page-headline-formulas/
- KlientBoost — Value Proposition Examples: https://www.klientboost.com/landing-pages/landing-page-value-proposition/
- Userpilot — Interactive Product Demos 2026 (цифры ×8, Navattic, HockeyStack): https://userpilot.com/blog/interactive-product-demo/
- KlientBoost — Social Proof / Testimonials: https://www.klientboost.com/landing-pages/landing-page-testimonials/
- WiserNotify — 10 Social Proof Tactics 2026: https://wisernotify.com/blog/landing-page-social-proof/
- bestchromeextensions — Chrome Extension Landing Page: https://bestchromeextensions.com/2025/02/23/chrome-extension-landing-page-convert-visitors-to-installs/
- Chrome for Developers — Web Store Best Practices: https://developer.chrome.com/docs/webstore/best-practices
- Forbes — Landing Pages That Build Trust (2026): https://www.forbes.com/councils/forbesbusinessdevelopmentcouncil/2026/07/14/how-to-create-high-converting-landing-pages-that-build-trust/
- SaaSHero — Trust Signals: https://www.saashero.net/design/landing-page-design-trust-signals/
