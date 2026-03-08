#!/bin/bash
# PostgreSQL Restore Script for AgroPlatform
# Usage: ./scripts/restore.sh <backup_file>
# Requires: docker compose running with postgres service

set -euo pipefail

BACKUP_FILE="${1:?Usage: ./scripts/restore.sh <backup_file.sql.gz>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  set -a
  # shellcheck source=.env
  source .env
  set +a
fi

DB_NAME="${POSTGRES_DB:-agroplatform_db}"
DB_USER="${POSTGRES_USER:-agroplatform}"

echo "WARNING: This will overwrite the database '$DB_NAME'!"
read -p "Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "==> Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"

echo "==> Database restored successfully from $BACKUP_FILE"
