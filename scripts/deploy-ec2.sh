#!/usr/bin/env bash
set -euo pipefail

APP_ARCHIVE="${APP_ARCHIVE:?APP_ARCHIVE must be set}"
APP_DIR="${APP_DIR:-/opt/sem6-devops-project}"
DEPLOY_SHA="${DEPLOY_SHA:-manual-$(date +%Y%m%d%H%M%S)}"
SERVICE_NAME="${SERVICE_NAME:-shopsmart-api}"

RELEASES_DIR="$APP_DIR/releases"
RELEASE_DIR="$RELEASES_DIR/$DEPLOY_SHA"
CURRENT_LINK="$APP_DIR/current"

mkdir -p "$RELEASES_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

tar -xzf "$APP_ARCHIVE" -C "$RELEASE_DIR"

npm ci --prefix "$RELEASE_DIR/client"
npm run build --prefix "$RELEASE_DIR/client"
npm ci --prefix "$RELEASE_DIR/server"
npm run build --prefix "$RELEASE_DIR/server"

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart "$SERVICE_NAME"
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$SERVICE_NAME" || pm2 start "$CURRENT_LINK/server/dist/main.js" --name "$SERVICE_NAME"
else
  echo "No supported process manager found. Restart the service manually."
fi

echo "Deployment completed for release $DEPLOY_SHA"
