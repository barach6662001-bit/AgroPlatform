#!/bin/bash
# Initialize Let's Encrypt certificates
# Usage: DOMAIN=your-domain.com EMAIL=your@email.com ./scripts/init-letsencrypt.sh

set -euo pipefail

DOMAIN="${DOMAIN:?Please set DOMAIN environment variable}"
EMAIL="${EMAIL:?Please set EMAIL environment variable}"

echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Certificate obtained! Restarting nginx..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx-proxy

echo "==> Done! HTTPS is now active for $DOMAIN"
