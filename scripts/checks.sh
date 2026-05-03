#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Running repository checks..."
npm run lint --prefix "$ROOT_DIR/client"
npm run test:ci --prefix "$ROOT_DIR/client"
npm run lint --prefix "$ROOT_DIR/server"
npm run test:ci --prefix "$ROOT_DIR/server"
npm run build --prefix "$ROOT_DIR/client"
npm run build --prefix "$ROOT_DIR/server"
