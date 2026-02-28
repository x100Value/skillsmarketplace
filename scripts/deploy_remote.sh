#!/usr/bin/env bash
set -euo pipefail
umask 077

APP_DIR="/root/skillsmarketplace"
ARCHIVE="/root/skillsmarketplace-deploy.tar.gz"
SRC_DIR="/root/SkillsMarketplace"
DB_USER="skillsmarketplace_app"
DB_NAME="skillsmarketplace_db"
DB_PASS="$(openssl rand -hex 18)"
WEBHOOK_SECRET="$(openssl rand -hex 20)"
ADMIN_TOKEN="$(openssl rand -hex 24)"
APP_USER="skillsmarketplace"
SECRETS_FILE="/root/skillsmarketplace.secrets"

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

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

cd "$APP_DIR"
cp .env.example .env
sed -i "s#^PORT=.*#PORT=8090#" .env
sed -i "s#^DATABASE_URL=.*#DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}#" .env
sed -i "s#^TELEGRAM_BOT_TOKEN=.*#TELEGRAM_BOT_TOKEN=replace_with_real_bot_token#" .env
sed -i "s#^WEBHOOK_SECRET_TOKEN=.*#WEBHOOK_SECRET_TOKEN=${WEBHOOK_SECRET}#" .env
sed -i "s#^BILLING_ADMIN_TOKEN=.*#BILLING_ADMIN_TOKEN=${ADMIN_TOKEN}#" .env
sed -i "s#^NODE_ENV=.*#NODE_ENV=production#" .env
chmod 600 .env

npm ci
npm run migrate
npm run build
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

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
User=${APP_USER}
Group=${APP_USER}
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${APP_DIR}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable skillsmarketplace.service
systemctl restart skillsmarketplace.service

cat > "${SECRETS_FILE}" <<SECRETS
APP_DIR=${APP_DIR}
DB_USER=${DB_USER}
DB_NAME=${DB_NAME}
DB_PASS=${DB_PASS}
WEBHOOK_SECRET_TOKEN=${WEBHOOK_SECRET}
BILLING_ADMIN_TOKEN=${ADMIN_TOKEN}
SECRETS

chmod 600 "${SECRETS_FILE}"

echo "DEPLOY_OK"
echo "APP_DIR=${APP_DIR}"
echo "SECRETS_FILE=${SECRETS_FILE}"
