#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Installing frontend dependencies..."
npm ci --prefix "$ROOT_DIR/client"

echo "Installing backend dependencies..."
npm ci --prefix "$ROOT_DIR/server"
