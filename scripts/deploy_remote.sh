#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/root/skillsmarketplace"
ARCHIVE="/root/skillsmarketplace-deploy.tar.gz"
SRC_DIR="/root/SkillsMarketplace"
DB_USER="skillsmarketplace_app"
DB_NAME="skillsmarketplace_db"
DB_PASS="$(openssl rand -hex 18)"
WEBHOOK_SECRET="$(openssl rand -hex 20)"
ADMIN_TOKEN="$(openssl rand -hex 24)"

rm -rf "$APP_DIR" "$SRC_DIR"
tar -xzf "$ARCHIVE" -C /root
mv "$SRC_DIR" "$APP_DIR"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

cd "$APP_DIR"
cp .env.example .env
sed -i "s#^PORT=.*#PORT=8090#" .env
sed -i "s#^DATABASE_URL=.*#DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}#" .env
sed -i "s#^TELEGRAM_BOT_TOKEN=.*#TELEGRAM_BOT_TOKEN=replace_with_real_bot_token#" .env
sed -i "s#^WEBHOOK_SECRET_TOKEN=.*#WEBHOOK_SECRET_TOKEN=${WEBHOOK_SECRET}#" .env
sed -i "s#^BILLING_ADMIN_TOKEN=.*#BILLING_ADMIN_TOKEN=${ADMIN_TOKEN}#" .env

npm ci
npm run migrate
npm run build

cat > /etc/systemd/system/skillsmarketplace.service <<SERVICE
[Unit]
Description=SkillsMarketplace Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable skillsmarketplace.service
systemctl restart skillsmarketplace.service

echo "DEPLOY_OK"
echo "APP_DIR=${APP_DIR}"
echo "DB_USER=${DB_USER}"
echo "DB_NAME=${DB_NAME}"
echo "DB_PASS=${DB_PASS}"
echo "WEBHOOK_SECRET_TOKEN=${WEBHOOK_SECRET}"
echo "BILLING_ADMIN_TOKEN=${ADMIN_TOKEN}"
