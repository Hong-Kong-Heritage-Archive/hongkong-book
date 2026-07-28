#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
elif [[ -f .env.example ]]; then
  set -a
  source .env.example
  set +a
fi

PORT="${PORT:-8081}"
npm run dev -- --port "$PORT"
