# SkillsMarketplace — состояние проекта

## Что делаем
- Собираем MVP Telegram Mini App + внешнюю Pro-панель, где пользователи создают Skill Check, платят Stars/TON-USDT и получают отчет о уникальности своего промта/скилла.
- Обеспечиваем dual-rail compliance: Stars внутри Telegram, TON-USDT через `/pro` с отдельным surface.
- Пишем законченную юрчасть: публикация публичной оферты, политики конфиденциальности и правил возврата, доступ к ним из интерфейсов.

## Что уже сделано
- Библиотека на Node.js/TypeScript с Express, рутингом `auth`, `payments`, `skill-check`, `history`, `billing`, `withdrawals`, `admin`.
- Telegram auth (`initData` verification) + session token, история, отчеты, ручные выводы, Skill Check с quote/run, балансная логика (hold/release/debit).
- Mini App интерфейс с табами (Home/Tool/History/Wallet/Settings), Pro-деск с токеном/TON-USDT intent, legal-центр и ссылки на документы.
- Документы: `docs/LEGAL_OFFER_RU.md`, `docs/PRIVACY_POLICY_RU.md`, `docs/REFUND_POLICY_RU.md`, `docs/PROJECT_SUMMARY_RU.md`.
- Деплой на сервер `5.129.227.217` под systemd сервисом `skillsmarketplace.service`, HTTPS для доменов.

## Где что лежит
- `src/` — backend (server.ts + middleware/routers/services, billing, skill checks, providers).
- `web/` — frontend Mini App + `pro.html`, `legal.html`, `styles.css`, `app.js`, `pro.js`.
- `docs/` — юридические markdownы и проектная сводка; теперь отдаются через `GET /docs`.
- `scripts/` — `deploy_remote.sh`, `migrate.ts`.
- `db/migrations/` — SQL-схемы для пользователей, баланса, skill checks.
- Корневые файлы: `README.md`, `.env.example`, `package.json`, `tsconfig.json`, `docker-compose.yml`.

## Далее можно
1. Завершить интеграцию реального LLM scoring и paid search API.
2. Добавить очередь фоновых задач, rate-limit в Redis, расширить observability.
3. Привести публикацию юрдокументов к версии, утвержденной юристом, и довестись до релиза.
