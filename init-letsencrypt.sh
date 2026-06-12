#!/bin/bash
# First-time Let's Encrypt cert setup.
# Run once on the server after cloning the repo and creating .env.
# After this, docker compose up -d handles everything including renewal.

set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

[ -z "${DOMAIN:-}" ] && { echo "Error: DOMAIN not set in .env"; exit 1; }
[ -z "${EMAIL:-}" ]  && { echo "Error: EMAIL not set in .env";  exit 1; }
STAGING=${STAGING:-0}

echo "==> Building image"
docker compose build

echo "==> Creating dummy cert so nginx can start"
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=localhost' 2>/dev/null
"

echo "==> Starting nginx"
docker compose up --force-recreate -d app

echo "==> Waiting for nginx..."
sleep 5

echo "==> Requesting certificate for $DOMAIN"
CERTBOT_ARGS="certonly --webroot -w /var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN"
[ "$STAGING" = "1" ] && CERTBOT_ARGS="$CERTBOT_ARGS --staging"
docker compose run --rm --entrypoint sh certbot -c "certbot $CERTBOT_ARGS"

echo "==> Reloading nginx with real cert"
docker compose exec app nginx -s reload

echo "==> Starting certbot renewal loop"
docker compose up -d certbot

echo ""
echo "Live at https://$DOMAIN"
