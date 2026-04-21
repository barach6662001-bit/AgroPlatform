---
layout: default
title: Production Secrets
---

# 🔐 Production Secrets Management

[← Back to Home](.)

---

## Overview

Agrotech uses environment variables for all sensitive configuration. Keeping secrets out of source control is critical — leaked credentials can compromise your database, allow unauthorized API access, or expose user data.

**Key principles:**
- ⚠️ **Never commit** real secrets to the repository (`.env` is in `.gitignore`)
- Store production secrets exclusively in **GitHub Secrets** (or a secrets manager)
- Use the `production` GitHub Environment to gate deployments behind required reviewers
- Rotate secrets immediately if they are ever accidentally exposed

---

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository before running the production deployment workflow:

| Secret | Used In | Description | Example / Generation |
|--------|---------|-------------|----------------------|
| `POSTGRES_PASSWORD` | `docker-compose.yml` → `api` connection string | PostgreSQL database password | `openssl rand -base64 32` |
| `JWT_KEY` | `docker-compose.yml` → `api` → `JwtSettings__Key` | HMAC key for signing JWT tokens (minimum 32 characters) | `openssl rand -base64 64` |
| `DOMAIN` | `nginx/prod.conf`, `scripts/init-letsencrypt.sh` | Production domain name for TLS certificate | `your-production-domain.com` |
| `EMAIL` | `scripts/init-letsencrypt.sh` | Email for Let's Encrypt registration and expiry notices | `admin@your-production-domain.com` |
| `CORS_ORIGIN` | `docker-compose.yml` → `api` → `Cors__AllowedOrigins__0` | Frontend URL allowed by CORS policy | `https://your-production-domain.com` |

---

## Step-by-Step: Configuring GitHub Secrets

### Via the GitHub UI

1. Open your repository on GitHub.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Enter the **Name** (e.g., `POSTGRES_PASSWORD`) and the **Secret** value.
5. Click **Add secret**.
6. Repeat for all five required secrets listed above.

### Via GitHub CLI (recommended)

```bash
# Generate and set a strong database password
gh secret set POSTGRES_PASSWORD --body "$(openssl rand -base64 32)"

# Generate and set a strong JWT signing key (≥ 32 characters)
gh secret set JWT_KEY --body "$(openssl rand -base64 64)"

# Set production domain (no https://, no trailing slash)
gh secret set DOMAIN --body "your-production-domain.com"

# Set Let's Encrypt registration email
gh secret set EMAIL --body "admin@your-production-domain.com"

# Set CORS origin for the frontend (include https://)
gh secret set CORS_ORIGIN --body "https://your-production-domain.com"
```

---

## GitHub Environment Setup (Recommended)

Using a dedicated `production` environment adds an approval gate and allows environment-scoped secrets:

### Create the environment

1. Go to **Settings** → **Environments** → **New environment**.
2. Name it `production`.
3. Under **Deployment protection rules**:
   - Enable **Required reviewers** and add at least one reviewer.
   - Enable **Restrict pushes that create matching branches** — restrict to the `main` branch.
4. Under **Environment secrets**, add the same five secrets listed above (environment secrets take precedence over repository secrets for jobs that reference the environment).

### Why use environments?

- Deployments to `production` require explicit approval from a reviewer.
- Secrets in the environment are only available to jobs that declare `environment: production`.
- You get a full deployment history with approvals logged in GitHub.

---

## Generating Strong Secret Values

### Strong JWT key (≥ 32 characters)

```bash
openssl rand -base64 64
```

This produces an 88-character Base64 string — well above the 32-character minimum required by the HMAC signing algorithm used in Agrotech.

### Strong database password

```bash
openssl rand -base64 32
```

This produces a 44-character random password that is URL-safe for connection strings.

---

## Local Development

For local development, you do **not** need to configure GitHub Secrets. The `docker-compose.yml` file provides safe defaults via `${VAR:-default}` substitution:

```bash
cp .env.example .env
# Edit .env if needed, then:
docker compose up --build -d
```

The defaults in `docker-compose.yml` are intentionally weak (e.g., `change_me_password`) and are only suitable for local, non-public environments.

---

## Secret Rotation Procedure

### Rotating `JWT_KEY`

Rotating the JWT signing key will **invalidate all existing user sessions** — users will need to log in again.

1. Generate a new key: `openssl rand -base64 64`
2. Update the secret in GitHub (Settings → Secrets and variables → Actions → `JWT_KEY` → Update).
3. Re-run the **Deploy to Production** workflow to apply the new key.
4. Monitor `/health/ready` and application logs to confirm the service is healthy.

### Rotating `POSTGRES_PASSWORD`

1. Generate a new password: `openssl rand -base64 32`
2. Update the PostgreSQL user password on the server:
   ```bash
   docker exec -it <postgres_container> psql -U agroplatform -c \
     "ALTER USER agroplatform WITH PASSWORD 'new-password-here';"
   ```
3. Update the secret in GitHub: `gh secret set POSTGRES_PASSWORD --body "new-password-here"`
4. Re-run the **Deploy to Production** workflow to restart the API with the new password.
5. Verify with `/health/ready`.

---

## Verifying Secrets Are Configured

You can run the validation workflow manually at any time without triggering a full deployment:

1. Go to **Actions** → **Validate Production Secrets**.
2. Click **Run workflow**.
3. The workflow will report which secrets are present (✅) and which are missing (❌).

The same validation runs automatically as the first job of the **Deploy to Production** workflow, blocking deployment if any secret is missing.

---

## Security Checklist

Before deploying to production, confirm:

- [ ] All 5 required secrets are set in GitHub (repository or `production` environment)
- [ ] `JWT_KEY` is at least 32 characters and randomly generated
- [ ] `POSTGRES_PASSWORD` is strong and unique (not reused from other projects)
- [ ] `.env` file is listed in `.gitignore` (it is by default)
- [ ] No real secret values appear in any committed file
- [ ] The `production` environment has required reviewers configured
- [ ] `DOMAIN` and `EMAIL` are correct for Let's Encrypt registration

---

[← Back to Home](.)
