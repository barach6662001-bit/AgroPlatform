#!/bin/bash
# Sets up a daily cron job for database backups
# Usage: sudo ./scripts/backup-cron-setup.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CRON_SCHEDULE="${BACKUP_SCHEDULE:-0 2 * * *}"  # Default: 2:00 AM daily

CRON_LINE="$CRON_SCHEDULE cd $PROJECT_DIR && ./scripts/backup.sh >> /var/log/agroplatform-backup.log 2>&1"

# Add cron job (avoid duplicates)
(crontab -l 2>/dev/null | grep -vF "scripts/backup.sh" ; echo "$CRON_LINE") | crontab -

echo "==> Cron job installed:"
echo "    Schedule: $CRON_SCHEDULE"
echo "    Project: $PROJECT_DIR"
echo "    Log: /var/log/agroplatform-backup.log"
