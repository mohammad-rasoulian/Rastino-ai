#!/usr/bin/env bash
set -euo pipefail

cd /home/sorena/multi-llm-hub

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/home/sorena/multi-llm-hub/backups/db"
DB="/home/sorena/multi-llm-hub/prisma/dev.db"
TMP_DIR="/tmp/rastino-db-backup-$TS"

mkdir -p "$BACKUP_DIR"
mkdir -p "$TMP_DIR"

if [ ! -f "$DB" ]; then
  echo "❌ DB not found: $DB"
  exit 1
fi

cp "$DB" "$TMP_DIR/dev.db"

if [ -f "$DB-wal" ]; then
  cp "$DB-wal" "$TMP_DIR/dev.db-wal"
fi

if [ -f "$DB-shm" ]; then
  cp "$DB-shm" "$TMP_DIR/dev.db-shm"
fi

tar -czf "$BACKUP_DIR/rastino-$TS.sqlite-files.tar.gz" -C "$TMP_DIR" .

rm -rf "$TMP_DIR"

find "$BACKUP_DIR" -type f -name "rastino-*.tar.gz" -mtime +14 -delete
find "$BACKUP_DIR" -type f -name "rastino-*.db.gz" -mtime +14 -delete

echo "✅ Backup created: $BACKUP_DIR/rastino-$TS.sqlite-files.tar.gz"
