#!/usr/bin/env bash
set -euo pipefail

cd /home/sorena/multi-llm-hub

TS="$(date +%Y%m%d-%H%M%S)"
TMP_GEN="/tmp/rastino-generated-images-deploy-$TS"

mkdir -p "$TMP_GEN"
mkdir -p public/generated/images
mkdir -p .next/standalone/public/generated/images 2>/dev/null || true

echo "---- Preserve generated images ----"
find public/generated/images -type f ! -name ".gitkeep" -exec cp {} "$TMP_GEN/" \; 2>/dev/null || true
find .next/standalone/public/generated/images -type f ! -name ".gitkeep" -exec cp {} "$TMP_GEN/" \; 2>/dev/null || true

echo "---- Prisma generate ----"
npx prisma generate

echo "---- Lint ----"
npm run lint

echo "---- Build ----"
NODE_ENV=production npm run build

echo "---- Copy static assets to standalone ----"
rm -rf .next/standalone/public
rm -rf .next/standalone/.next/static

cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static

mkdir -p public/generated/images
mkdir -p .next/standalone/public/generated/images

find "$TMP_GEN" -type f -exec cp {} public/generated/images/ \; 2>/dev/null || true
find "$TMP_GEN" -type f -exec cp {} .next/standalone/public/generated/images/ \; 2>/dev/null || true

touch public/generated/images/.gitkeep
touch .next/standalone/public/generated/images/.gitkeep

echo "---- Restart PM2 with ecosystem ----"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

sleep 3

echo "---- Health ----"
curl -fsS http://127.0.0.1:3000/api/health
echo

echo "✅ Deploy completed"
