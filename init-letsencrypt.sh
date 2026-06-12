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

echo "==> Building image"
docker compose build

echo "==> Requesting certificate for $DOMAIN"
docker compose run --rm -p 80:80 --entrypoint certbot certbot \
  certonly --standalone \
  --email "$EMAIL" --agree-tos --no-eff-email -d "$DOMAIN"

echo "==> Starting nginx and certbot renewal loop"
docker compose up -d

echo ""
echo "Live at https://$DOMAIN"
