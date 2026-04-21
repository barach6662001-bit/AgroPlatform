#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if [ -d frontend ] && [ -f frontend/package.json ]; then
  echo "[post-merge] installing frontend dependencies"
  (cd frontend && npm install --no-audit --no-fund --prefer-offline)
fi
