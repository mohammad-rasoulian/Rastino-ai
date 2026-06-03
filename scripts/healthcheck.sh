#!/usr/bin/env bash
set -euo pipefail

LOCAL_URL="${LOCAL_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
PUBLIC_URL="${RASTINO_PUBLIC_HEALTH_URL:-}"

check_url() {
  local url="$1"

  curl -fsS --max-time 8 "$url" | grep -q '"ok":true'
}

if check_url "$LOCAL_URL"; then
  echo "✅ Local health OK: $LOCAL_URL"
else
  echo "❌ Local health failed: $LOCAL_URL"
  exit 1
fi

if [ -n "$PUBLIC_URL" ]; then
  if check_url "$PUBLIC_URL"; then
    echo "✅ Public health OK: $PUBLIC_URL"
  else
    echo "❌ Public health failed: $PUBLIC_URL"
    exit 2
  fi
fi
