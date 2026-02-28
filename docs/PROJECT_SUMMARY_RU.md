# SkillsMarketplace - Полное резюме проекта

Дата обновления: 27 февраля 2026 года

## 1. Что это за проект
SkillsMarketplace - MVP сервиса внутри Telegram + web, где:
- пользователь пополняет баланс (внутри Telegram через Stars, во внешнем контуре через TON/USDT);
- запускает AI-проверки;
- основной monetization-флоу: платная `Skill Check` проверка уникальности скилла/промта;
- получает отчет с `uniqueness score`, `risk level` и источниками.

Ключевой принцип: `dual-rail compliant`.
- Telegram контур: только Stars для digital usage.
- Внешний web контур `/pro`: TON/USDT для power users и крупных пополнений.

## 2. Что уже сделано
1. Backend на Node.js + TypeScript + Express + PostgreSQL.
2. Telegram auth (`initData` signature verify).
3. Billing/ledger:
- credit/hold/debit/release;
- idempotent payments.
4. Skill Check (не чат):
- `POST /api/skill-check/quote`;
- `POST /api/skill-check/run`;
- режимы `free/paid/hybrid`;
- расчет цены до запуска;
- списание кредитов по факту.
5. История операций и задач (`/api/history`).
6. Ручные выводы + админ-решения.
7. UI mini app (Home/Tool/History/Wallet/Settings) и `/pro` дашборд.
8. Деплой на сервер `5.129.227.217`, отдельный сервис и отдельная БД.
9. HTTPS включен для:
- `https://skillsmarketplace.ru`
- `https://www.skillsmarketplace.ru`

## 3. Где что лежит
Корень проекта: `C:\Users\Вал\Desktop\SkillsMarketplace`

Основные директории:
- `src/` - backend код.
- `src/routes/` - HTTP API.
- `src/services/` - бизнес-логика (billing, skill check, providers).
- `db/migrations/` - SQL миграции.
- `web/` - frontend (mini app + pro page).
- `docs/` - юридические документы и это резюме.
- `scripts/` - служебные скрипты (migrate, deploy).

Ключевые файлы:
- `src/server.ts` - сборка Express приложения.
- `src/routes/skillCheck.ts` - API проверки уникальности.
- `src/services/skillCheck.ts` - логика quote/run и отчет.
- `src/services/skillCheckProviders.ts` - free/paid search провайдеры.
- `src/services/billing.ts` - холды/списания/баланс.
- `db/migrations/003_skill_checks.sql` - таблица проверок.
- `web/index.html`, `web/app.js` - mini app UI.
- `web/pro.html`, `web/pro.js` - внешний контур оплаты.

## 4. API (актуальный список)
- `GET /health`
- `POST /api/auth/telegram`
- `GET /api/me`
- `GET /api/history`
- `GET /api/pricing/rails`
- `POST /api/pricing/quote`
- `POST /api/tasks/run`
- `POST /api/skill-check/quote`
- `POST /api/skill-check/run`
- `POST /api/payments/telegram/webhook`
- `POST /api/payments/ton-usdt/create-intent`
- `POST /api/payments/ton-usdt/confirm` (admin)
- `POST /api/withdrawals/request`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/:id/approve`
- `POST /api/admin/withdrawals/:id/reject`

## 5. Переменные окружения и API ключи
Файл-шаблон: `.env.example`  
Рабочий файл: `.env` (не коммитить)

Критичные переменные:
- `DATABASE_URL` - строка подключения к PostgreSQL.
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота.
- `WEBHOOK_SECRET_TOKEN` - секрет webhook.
- `BILLING_ADMIN_TOKEN` - токен admin API.

Платежи/цены:
- `STARS_PLATFORM_FEE_PERCENT`
- `TON_USDT_ENABLED`
- `TON_USDT_WALLET`
- `USDT_TO_STARS_RATE`

Skill Check:
- `SKILLCHECK_BASE_CREDITS`
- `SKILLCHECK_PER_1K_CHARS_CREDITS`
- `SKILLCHECK_PER_QUERY_CREDITS`
- `SKILLCHECK_MAX_QUERIES`
- `SKILLCHECK_PAID_SEARCH_ENDPOINT`
- `SKILLCHECK_PAID_SEARCH_API_KEY`
- `SKILLCHECK_FREE_SEARCH_ENDPOINT`
- `SKILLCHECK_LLM_API_KEY`
- `SKILLCHECK_LLM_MODEL`

Рекомендация:
- хранить production ключи только на сервере в `.env`;
- не хранить секреты в git/README/чатах.

## 6. Инфраструктура (production)
Сервер: `root@5.129.227.217`

Развертывание:
- директория приложения: `/root/skillsmarketplace`
- systemd сервис: `skillsmarketplace.service`
- backend порт: `8090`
- nginx site: `/etc/nginx/sites-available/skillsmarketplace`
- SSL: Let's Encrypt для `skillsmarketplace.ru` и `www.skillsmarketplace.ru`

База данных:
- PostgreSQL локально на сервере.
- отдельные DB user и DB name для проекта (изолировано от других сервисов).

## 7. Что нужно сделать дальше (roadmap)
1. Заполнить production ключи:
- `TELEGRAM_BOT_TOKEN`
- `SKILLCHECK_PAID_SEARCH_API_KEY`
- `SKILLCHECK_LLM_API_KEY`
2. Подключить реальный LLM scoring вместо fallback-эвристики.
3. Добавить очередь фоновых задач для долгих проверок.
4. Вынести rate-limit в Redis (вместо in-memory).
5. Усилить админку:
- IP allowlist;
- 2FA;
- отдельные роли.
6. Наблюдаемость:
- метрики;
- алерты;
- backup + restore drills.
7. Финальный юридический пакет:
- заполнить реквизиты;
- финальная правка юристом;
- публикация в интерфейсе.

## 8. Ограничения текущего MVP
1. Skill Check дает вероятностную оценку, не юридическую гарантию уникальности.
2. Нет полноценного KYC/compliance контура для масштабного финтех-сценария.
3. Нет продвинутой антифрод-системы на уровне ML/behavior scoring.
4. Часть процессов (например спорные возвраты) рассчитана на ручной разбор.
5. В тестовом контуре MVP цены, комиссии и процентные ставки могут изменяться; источник истины - текущие значения в интерфейсе и актуальная редакция правовых документов.
