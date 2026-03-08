#!/bin/bash
# PostgreSQL Backup Script for AgroPlatform
# Usage: ./scripts/backup.sh [backup_dir]
# Requires: docker compose running with postgres service

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/agroplatform_${TIMESTAMP}.sql.gz"

# Load environment variables
if [ -f .env ]; then
  set -a
  # shellcheck source=.env
  source .env
  set +a
fi

DB_NAME="${POSTGRES_DB:-agroplatform_db}"
DB_USER="${POSTGRES_USER:-agroplatform}"

mkdir -p "$BACKUP_DIR"

echo "==> Starting backup of database '$DB_NAME'..."
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "==> Backup completed: $BACKUP_FILE ($SIZE)"
else
  echo "ERROR: Backup file is empty!" >&2
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "agroplatform_*.sql.gz" -mtime +30 -delete
echo "==> Old backups cleaned up (30+ days)"
