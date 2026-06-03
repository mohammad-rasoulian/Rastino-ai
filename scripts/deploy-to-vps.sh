#!/usr/bin/env bash
set -euo pipefail

cd ~/multi-llm-hub

VPS_IP="${VPS_IP:-195.177.255.98}"
TS="$(date +%Y%m%d-%H%M%S)"
BUNDLE="$HOME/rastino-transfer/rastino-standalone-vps-$TS.tar.gz"

mkdir -p "$HOME/rastino-transfer"

echo "---- 1) Local build ----"
npm run healthcheck
npx prisma generate
NODE_ENV=production npm run build

echo "---- 2) Prepare standalone ----"
rm -rf .next/standalone/public
rm -rf .next/standalone/.next/static
rm -rf .next/standalone/prisma

cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r prisma .next/standalone/prisma

mkdir -p .next/standalone/public/generated/images
touch .next/standalone/public/generated/images/.gitkeep

echo "---- 3) Create bundle ----"
tar -czf "$BUNDLE" -C .next/standalone .
ls -lh "$BUNDLE"

echo "---- 4) Upload to VPS with scp ----"
scp "$BUNDLE" root@"$VPS_IP":/root/rastino-standalone.tar.gz
scp .env root@"$VPS_IP":/root/rastino.env

echo "---- 5) Deploy on VPS with ssh ----"
ssh root@"$VPS_IP" 'bash -s' <<'REMOTE'
set -euo pipefail

APP_BASE="/var/www/rastino"
RELEASES="$APP_BASE/releases"
TS="$(date +%Y%m%d-%H%M%S)"
RELEASE="$RELEASES/$TS"
NODE_BIN="$(command -v node)"

mkdir -p "$RELEASES" "$RELEASE"

systemctl stop rastino 2>/dev/null || true

tar -xzf /root/rastino-standalone.tar.gz -C "$RELEASE"
cp /root/rastino.env "$RELEASE/.env"

sed -i "s|^RASTINO_PROJECT_ROOT=.*|RASTINO_PROJECT_ROOT=\"$RELEASE\"|" "$RELEASE/.env" || true
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"file:$RELEASE/prisma/dev.db\"|" "$RELEASE/.env" || true
sed -i 's|^PORT=.*|PORT="3000"|' "$RELEASE/.env" || true
sed -i 's|^HOSTNAME=.*|HOSTNAME="0.0.0.0"|' "$RELEASE/.env" || true
sed -i 's|^NODE_ENV=.*|NODE_ENV="production"|' "$RELEASE/.env" || true

grep -q '^RASTINO_PROJECT_ROOT=' "$RELEASE/.env" || echo "RASTINO_PROJECT_ROOT=\"$RELEASE\"" >> "$RELEASE/.env"
grep -q '^DATABASE_URL=' "$RELEASE/.env" || echo "DATABASE_URL=\"file:$RELEASE/prisma/dev.db\"" >> "$RELEASE/.env"
grep -q '^PORT=' "$RELEASE/.env" || echo 'PORT="3000"' >> "$RELEASE/.env"
grep -q '^HOSTNAME=' "$RELEASE/.env" || echo 'HOSTNAME="0.0.0.0"' >> "$RELEASE/.env"
grep -q '^NODE_ENV=' "$RELEASE/.env" || echo 'NODE_ENV="production"' >> "$RELEASE/.env"

ln -sfn "$RELEASE" "$APP_BASE/current"

cat > /etc/systemd/system/rastino.service <<EOF
[Unit]
Description=Rastino Next.js standalone service
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_BASE/current
EnvironmentFile=$APP_BASE/current/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=$NODE_BIN $APP_BASE/current/server.js
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=20
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rastino

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable rastino
systemctl restart rastino

cat > /etc/nginx/sites-available/rastino <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF

ln -sf /etc/nginx/sites-available/rastino /etc/nginx/sites-enabled/rastino
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

sleep 5

curl -fsS http://127.0.0.1:3000/api/health
echo
curl -fsS http://127.0.0.1/api/health
echo

systemctl status rastino --no-pager | head -n 20
systemctl status nginx --no-pager | head -n 15

echo "✅ VPS deploy done"
REMOTE

echo "---- 6) Public test ----"
curl -I "http://$VPS_IP" || true
curl "http://$VPS_IP/api/health" || true

echo
echo "✅ Deploy finished: http://$VPS_IP"
