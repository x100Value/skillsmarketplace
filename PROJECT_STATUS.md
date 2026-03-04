# SkillsMarketplace — Project Status

_Последнее обновление: 2026-03-01_

---

## Что за приложение

**SkillsMarketplace** — AI-маркетплейс навыков, оформленный как Telegram Mini App (TMA).

Пользователи покупают и продают AI Skill'ы — готовые промпты/инструкции для ChatGPT/Claude/etc. Каждый скилл защищён 3-уровневой системой защиты от кражи контента:
- **Semantic Similarity** — сравнение смысловой близости
- **Structural Fingerprint** — структурный отпечаток
- **Output Fingerprinting** — скрытый водяной знак (zero-width символы в тексте)

Три экрана приложения:
1. **Market** — каталог скиллов, поиск, фильтры по категориям, alpha-banner
2. **Studio** — Skill Check: вставить промпт → проверить уникальность → LLM оценка
3. **Ledger** — баланс, история транзакций, заявка в альфу, настройки

Валюта: **Stardust (✨)**, 1 Telegram ⭐ Star = 10 ✨ Stardust (`STARDUST_RATE = 10`).

**Текущий режим: ALPHA** — платежи отключены, доступ по заявке.

---

## Инфраструктура

| Параметр | Значение |
|---|---|
| Сервер | `root@5.129.227.217` |
| SSH ключ | `~/.ssh/id_ed25519` |
| Домен | `https://skillsmarketplace.ru` |
| App dir на сервере | `/root/skillsmarketplace` |
| Systemd сервис | `skillsmarketplace.service` |
| Порт Node.js | `8090` (bind `127.0.0.1` — снаружи закрыт через ufw) |
| Nginx конфиг | `/etc/nginx/sites-available/skillsmarketplace` |
| БД | PostgreSQL, база `skillsmarketplace_db`, user `skillsmarketplace_app` |
| Telegram Bot | токен в `.env` → `TELEGRAM_BOT_TOKEN` |
| Admin TG ID | `406185603` (заявки в альфу приходят сюда в личку) |

### Команды на сервере
```bash
# перезапуск приложения
systemctl restart skillsmarketplace

# логи в реальном времени
journalctl -u skillsmarketplace -f --lines=50

# сборка TypeScript
cd /root/skillsmarketplace && npm run build

# nginx: проверить конфиг и перезагрузить
nginx -t && systemctl reload nginx

# healthcheck
curl http://127.0.0.1:8090/health
```

---

## Структура проекта

```
SkillsMarketplace/
├── src/                            # Backend (TypeScript → dist/)
│   ├── server.ts                   # Express: middleware, все роуты, статика
│   ├── config.ts                   # Env-переменные с типами и дефолтами
│   ├── logger.ts                   # Pino logger
│   ├── db.ts                       # PostgreSQL pool (pg)
│   ├── telegram.ts                 # Telegram Bot API helpers
│   ├── types.ts                    # Общие TypeScript типы
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # requireAuth — JWT из Telegram initData
│   │   ├── admin.ts                # requireAdmin — ADMIN_TELEGRAM_IDS
│   │   └── rateLimit.ts            # Sliding window rate limiter
│   │
│   ├── routes/
│   │   ├── auth.ts                 # POST /api/auth/telegram
│   │   ├── me.ts                   # GET /api/me
│   │   ├── skills.ts               # GET /api/skills
│   │   ├── tasks.ts                # GET/POST /api/tasks
│   │   ├── skillCheck.ts           # POST /api/skill-check
│   │   ├── history.ts              # GET /api/history
│   │   ├── payments.ts             # Stars topup + Telegram webhook
│   │   ├── withdrawals.ts          # POST /api/withdrawals
│   │   ├── pricing.ts              # GET /api/pricing
│   │   ├── moderation.ts           # POST /api/moderation
│   │   ├── referral.ts             # GET/POST /api/referral
│   │   ├── bot.ts                  # Bot webhook (команды бота)
│   │   ├── admin.ts                # /api/admin/* (только для админов)
│   │   └── alpha.ts                # POST /api/alpha/apply → Telegram DM
│   │
│   ├── services/
│   │   ├── billing.ts              # Hold / release / debit баланса
│   │   ├── llm.ts                  # OpenAI API
│   │   ├── skillCheck.ts           # Оркестратор проверки скиллов
│   │   ├── skillCheckProviders.ts  # Провайдеры: semantic / fingerprint / output
│   │   ├── audit.ts                # Аудит-лог операций
│   │   ├── users.ts                # CRUD пользователей
│   │   ├── sessions.ts             # JWT сессии
│   │   ├── pricing.ts              # Логика тарифов
│   │   ├── referral.ts             # Реферальная логика
│   │   └── surface.ts              # Определение поверхности (TMA / Pro / Web)
│   │
│   └── utils/
│       └── crypto.ts               # HMAC-SHA256 helpers
│
├── web/                            # Frontend (статика, раздаётся Express)
│   ├── index.html                  # Главная TMA (Market / Studio / Ledger)
│   ├── app.js                      # Весь клиентский JS (i18n, экраны, API)
│   ├── styles.css                  # Стили (дизайн-токены, компоненты)
│   ├── pro.html                    # Pro-панель (десктоп, вне TMA)
│   ├── pro.js                      # JS для pro.html
│   └── legal.html                  # Список юридических документов
│
├── docs/                           # Markdown-документы (GET /doc?f=FILE.md)
│   ├── LEGAL_OFFER_RU.md
│   ├── PRIVACY_POLICY_RU.md
│   ├── REFUND_POLICY_RU.md
│   └── PROJECT_SUMMARY_RU.md
│
├── db/migrations/                  # SQL-миграции (применять по порядку)
│   ├── 001_init.sql                # Пользователи, баланс
│   ├── 002_hybrid_payments.sql     # Stars + TON-USDT
│   ├── 003_skill_checks.sql        # Таблица проверок
│   ├── 004_sessions_token_hash.sql # Хэши токенов сессий
│   ├── 005_billing_hardening.sql   # Защита от race conditions
│   ├── 006_stars_topup_orders.sql  # Заказы пополнения Stars
│   ├── 007_influencer_promo_requests.sql
│   ├── 008_withdrawal_hold_window.sql
│   ├── 009_user_moderation_and_leak_reports.sql
│   └── 010_skills.sql              # Таблица скиллов маркетплейса
│
├── PROJECT_STATUS.md               # Этот файл
├── package.json
├── tsconfig.json
├── .env                            # Секреты (не в git)
├── .env.example                    # Шаблон переменных окружения
└── docker-compose.yml
```

---

## API эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/auth/telegram` | Вход через Telegram initData |
| `GET` | `/api/me` | Профиль и баланс текущего пользователя |
| `GET` | `/api/skills` | Список скиллов маркетплейса |
| `POST` | `/api/skill-check` | Запустить проверку скилла |
| `GET` | `/api/history` | История транзакций (ledger) |
| `GET` | `/api/pricing` | Тарифы |
| `POST` | `/api/payments/*` | Пополнение Stars + webhook |
| `POST` | `/api/withdrawals` | Запрос вывода средств |
| `POST` | `/api/alpha/apply` | Заявка в альфу → DM в Telegram |
| `GET` | `/api/referral` | Реферальная программа |
| `POST` | `/api/moderation` | Репорт контента |
| `GET` | `/api/admin/*` | Админ-панель (только ADMIN_TELEGRAM_IDS) |
| `GET` | `/health` | Healthcheck `{"ok":true}` |
| `GET` | `/doc?f=FILE.md` | Просмотр markdown-документа |

---

## Frontend — как устроен app.js

**Архитектура:** SPA без фреймворка. Экраны — `div.screen` с `position:absolute`, переключаются через CSS класс `.active`. Анимации — slide-in/out через CSS transitions.

**Ключевые функции:**
| Функция | Что делает |
|---|---|
| `init()` | Запуск: auth → loadBalance → loadSkills → loadHistory |
| `showScreen(name)` | Переключение экранов, обновление topbar title/sub |
| `renderSkillCard(s)` | Карточка скилла (иконка, автор, цена в Stars, runs) |
| `showAlphaModal()` | Модалка заявки: роль + заметка → POST /api/alpha/apply |
| `loadHistory()` | Ledger таблица с цветными бейджами событий |
| `runCheck()` | Skill Check: POST /api/skill-check → показать результаты |
| `copyContent(id)` | Копирование контента + invisible watermark |
| `alphaApply()` | Открывает alpha modal (заглушка для всех платежей) |

**i18n:** EN + RU, хранится в `localStorage('lang')`, переключается в настройках.

**Alpha-режим:** `buySkill()`, `topUp()`, `doWithdraw()` — все вызывают `alphaApply()` вместо реальных платежей.

**Дизайн-токены:**
```css
--bg: #070a0f          /* основной фон */
--surface: #0d1219     /* карточки */
--accent: #00e5ff      /* cyan — основной акцент */
--accent2: #7c3aed     /* purple — вторичный */
--accent3: #10b981     /* green — успех */
--gold: #f59e0b        /* gold — Stars / Stardust */
--text: #f1f5f9
--hint: #64748b
--danger: #ef4444
--nav-h: 60px          /* высота bottom nav */
--top-h: 56px          /* высота topbar */
```
Шрифты: `Space Mono` (mono заголовки) + `Syne` (основной текст).

---

## Что было сделано

### Фаза 1 — Бэкенд MVP
- Express + TypeScript сервер с полным набором роутов
- Telegram initData верификация (HMAC-SHA256), JWT сессии
- Балансная система: hold → release / debit, защита от race conditions
- Skill Check: 3-уровневая защита контента (semantic / structural / output)
- LLM интеграция через OpenAI API
- 10 SQL-миграций (001–010)
- Реферальная система, модерация, influencer promo, admin API

### Фаза 2 — Полный редизайн фронтенда
- Прототип-источник: `C:\Users\Вал\Downloads\skills-marketplace.html`
- Полная перезапись `index.html`, `app.js`, `styles.css`
- Mobile-first bottom nav (TMA ≠ desktop sidebar)
- Компоненты: stat-cards, skill-cards, badge (5 типов), check-panel, results-grid, protection-grid, ledger-table, creator-card, alpha-banner, role-btn

### Фаза 3 — Alpha-запуск
- Все платежи отключены (заглушки → alpha modal)
- Новый роут `POST /api/alpha/apply` → `src/routes/alpha.ts`
- Telegram Bot отправляет DM администратору `406185603`:
  - `@handle`, Telegram ID, роль (creator/buyer/both), заметка, время UTC

### Фаза 4 — Security Hardening
| Исправление | Что сделали |
|---|---|
| F-01 | Порт 8090 закрыт: `ufw deny 8090` + `listen(PORT, "127.0.0.1")` |
| F-02 | Глобальный error handler → `{"error":"Internal error"}` |
| F-03 | `/api/*` catch-all → `{"error":"Not found"}` (не HTML) |
| F-04 | `Permissions-Policy` header в nginx (camera/mic/geo/payment/usb=off) |
| F-06 | HSTS `preload` + `max-age=31536000` в nginx |
| F-07 | Убран дублирующийся `Cache-Control` из nginx |
| F-08 | `server_tokens off` — версия nginx скрыта |
| F-09 | Auth ошибки не раскрывают детали валидации |
| F-10 | `robots.txt` — закрыт `/api/` и `/docs` от индексации |
| Bonus | Блокировка сканеров (wp-admin / .env / .git / .php → HTTP 444) |

---

## Что делать дальше

### Приоритет 1 — Открыть альфу
- [ ] Отобрать первых пользователей из заявок (смотреть DM в Telegram)
- [ ] Выдать тестовый баланс вручную через admin API
- [ ] Получить обратную связь по UX и скиллам

### Приоритет 2 — Включить платежи
- [ ] Раскомментировать `topUp()`, `buySkill()`, `doWithdraw()` в `app.js`
- [ ] Протестировать Telegram Stars webhook
- [ ] Настроить реальный вывод средств

### Приоритет 3 — Наполнение маркетплейса
- [ ] Добавить реальные скиллы от создателей (сейчас 10 демо-заглушек)
- [ ] Форма публикации скилла из Studio → Create
- [ ] Рейтинг, отзывы, расширенная фильтрация

### Приоритет 4 — Технический долг
- [ ] Обновить nginx до 1.26.3+ (CVE-2025-23419, SSL session reuse bypass)
  - Требует добавить официальный репо `nginx.org/packages/ubuntu` вручную
- [ ] Redis для rate limiting (сейчас in-memory, не масштабируется)
- [ ] Фоновая очередь для LLM задач (сейчас синхронно — медленно)
- [ ] Убрать `unsafe-inline` из CSP `style-src` (заменить на nonce/хэши)
- [ ] Настроить git-деплой или rsync-скрипт (локальные файлы ≠ сервер)
- [ ] Мониторинг / алерты (Sentry, Grafana или хотя бы uptime-check)

### Приоритет 5 — Правовое
- [ ] Финальная версия оферты, политик (сейчас помечены "MVP Draft")
- [ ] Добавить реквизиты юрлица / ИП в документы

---

## Известные ограничения

| Проблема | Комментарий |
|---|---|
| Платежи заглушены | Намеренно (alpha mode) |
| 10 скиллов — демо | Нужны реальные создатели |
| LLM scoring — синхронный OpenAI вызов | Дорого при масштабе, нужна очередь |
| CSP `unsafe-inline` в style-src | Низкий риск для TMA, оставлено пока |
| nginx 1.24.0 (CVE-2025-23419) | Нет нового пакета в Ubuntu 24.04 repo |
| Локальные файлы ≠ файлы на сервере | Правки делались напрямую на сервере |
