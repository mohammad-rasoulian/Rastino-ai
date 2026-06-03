#!/usr/bin/env bash
set -euo pipefail

cd /home/sorena/multi-llm-hub

echo "===== DATE ====="
date -Is

echo
echo "===== PM2 STATUS ====="
pm2 status || true

echo
echo "===== HEALTH LOCAL ====="
curl -i --max-time 10 http://127.0.0.1:3000/api/health || true

echo
echo
echo "===== PORT 3000 ====="
ss -ltnp 2>/dev/null | grep ':3000' || true

echo
echo "===== PROCESS ====="
ps aux | grep -E 'rastino|server.js|next' | grep -v grep || true

echo
echo "===== DISK ====="
df -h / /home /home/sorena/multi-llm-hub 2>/dev/null || df -h

echo
echo "===== MEMORY ====="
free -h || true

echo
echo "===== PM2 LOGS ====="
pm2 logs rastino --lines 120 --nostream || true

echo
echo "===== WATCHDOG LOG ====="
tail -n 120 logs/watchdog.log 2>/dev/null || true
