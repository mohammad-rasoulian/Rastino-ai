#!/usr/bin/env bash
set -euo pipefail

cd /home/sorena/multi-llm-hub

export PATH="/home/sorena/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LOG_FILE="/home/sorena/multi-llm-hub/logs/watchdog.log"
LOCK_FILE="/tmp/rastino-watchdog.lock"
LOCAL_URL="http://127.0.0.1:3000/api/health"

mkdir -p "$(dirname "$LOG_FILE")"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -Is)] watchdog already running; skip" >> "$LOG_FILE"
  exit 0
fi

log() {
  echo "[$(date -Is)] $*" >> "$LOG_FILE"
}

health_ok() {
  curl -fsS --max-time 8 "$LOCAL_URL" | grep -q '"ok":true'
}

log "watchdog check started"

if health_ok; then
  log "healthy"
  exit 0
fi

log "health failed; collecting diagnostics"

{
  echo "----- date -----"
  date -Is
  echo
  echo "----- pm2 status -----"
  pm2 status || true
  echo
  echo "----- port 3000 -----"
  ss -ltnp 2>/dev/null | grep ':3000' || true
  echo
  echo "----- disk -----"
  df -h /home/sorena/multi-llm-hub || true
  echo
  echo "----- memory -----"
  free -h || true
  echo
  echo "----- last pm2 logs -----"
  pm2 logs rastino --lines 80 --nostream || true
} >> "$LOG_FILE" 2>&1

log "trying pm2 restart rastino"

pm2 restart rastino --update-env >> "$LOG_FILE" 2>&1 || true

sleep 8

if health_ok; then
  log "recovered with pm2 restart"
  pm2 save >> "$LOG_FILE" 2>&1 || true
  exit 0
fi

log "restart did not recover; trying ecosystem startOrReload"

pm2 startOrReload ecosystem.config.cjs --update-env >> "$LOG_FILE" 2>&1 || true

sleep 8

if health_ok; then
  log "recovered with ecosystem startOrReload"
  pm2 save >> "$LOG_FILE" 2>&1 || true
  exit 0
fi

log "still unhealthy after recovery attempts"
exit 1
