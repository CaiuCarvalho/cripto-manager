#!/bin/bash
set -e

APP_DIR="/var/www/agon/app"

echo "==> Instalando dependencias do backend..."
cd "$APP_DIR/backend"
npm install --omit=dev

echo "==> Instalando dependencias do frontend..."
cd "$APP_DIR/frontend"
npm install

echo "==> Buildando frontend..."
npm run build

echo "==> Copiando config do nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-enabled/agon

echo "==> Validando nginx..."
nginx -t

echo "==> Reiniciando PM2..."
pm2 delete agon-api 2>/dev/null || true
pm2 delete agon-web 2>/dev/null || true

pm2 start "$APP_DIR/backend/src/index.js" --name agon-api
pm2 start npm --name agon-web --cwd "$APP_DIR/frontend" -- start -- -p 30000

pm2 save

echo "==> Recarregando nginx..."
systemctl reload nginx

echo ""
echo "Deploy concluido!"
pm2 list
