# Backup & Restore Guide

This guide explains how to back up and restore the AgroPlatform PostgreSQL database.

---

## Prerequisites

- Docker Compose running with the `postgres` service (`docker compose up -d`)
- The scripts require Bash and standard Unix utilities (`gzip`, `gunzip`, `find`, `du`)

---

## Quick Reference

| Task | Command |
|------|---------|
| Create a backup | `./scripts/backup.sh` |
| Create a backup to a custom directory | `./scripts/backup.sh /path/to/backups` |
| Restore from a backup | `./scripts/restore.sh backups/agroplatform_<timestamp>.sql.gz` |
| Install daily cron job | `sudo ./scripts/backup-cron-setup.sh` |

---

## 1. Creating a Backup

```bash
./scripts/backup.sh [backup_dir]
```

- **`backup_dir`** — Optional. Directory where backup files are stored. Defaults to `./backups`.
- Backup files are named `agroplatform_YYYYMMDD_HHMMSS.sql.gz`.
- The script exits with a non-zero status if the backup file is empty.
- Backup files older than 30 days are automatically deleted.

### Environment variables

The script reads database credentials from a `.env` file in the project root (if present), or falls back to these defaults:

| Variable | Default |
|----------|---------|
| `POSTGRES_DB` | `agroplatform_db` |
| `POSTGRES_USER` | `agroplatform` |

### Example

```bash
# Backup to default ./backups directory
./scripts/backup.sh

# Backup to a custom path
./scripts/backup.sh /mnt/nas/agroplatform-backups
```

---

## 2. Restoring from a Backup

> **Warning:** Restoring overwrites the current database. All existing data will be replaced.

```bash
./scripts/restore.sh <backup_file.sql.gz>
```

The script will prompt for confirmation before proceeding.

### Example

```bash
./scripts/restore.sh backups/agroplatform_20260308_020000.sql.gz
```

---

## 3. Automated Daily Backups (Cron)

Use `backup-cron-setup.sh` to install a cron job that runs `backup.sh` automatically:

```bash
sudo ./scripts/backup-cron-setup.sh
```

- The default schedule is **2:00 AM daily** (`0 2 * * *`).
- Override the schedule by setting the `BACKUP_SCHEDULE` environment variable before running the script:

```bash
BACKUP_SCHEDULE="0 3 * * *" sudo ./scripts/backup-cron-setup.sh
```

- Cron output is logged to `/var/log/agroplatform-backup.log`.
- Running the setup script again updates the existing cron entry without creating duplicates.

### Verifying the cron job

```bash
crontab -l
```

---

## 4. Manual Backup (without scripts)

If you need to create a backup without using the provided scripts:

```bash
docker compose exec -T postgres pg_dump \
  -U agroplatform \
  -d agroplatform_db \
  --clean --if-exists \
  | gzip > agroplatform_manual_$(date +%Y%m%d_%H%M%S).sql.gz
```

To restore manually:

```bash
gunzip -c <backup_file.sql.gz> \
  | docker compose exec -T postgres psql \
      -U agroplatform \
      -d agroplatform_db
```

---

## 5. Backup File Location

Backup files are stored in `./backups/` by default. This directory is listed in `.gitignore` to prevent accidental commits of backup data.

For production environments, consider storing backups on a separate volume or remote storage (e.g., S3, NFS) to ensure they are available if the primary host fails.
