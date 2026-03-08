# Local Development Guide

This guide walks you through running AgroPlatform locally from source.

---

## Prerequisites

| Requirement | Minimum version | Notes |
|-------------|----------------|-------|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0) | 8.0 | `dotnet --version` to verify |
| [PostgreSQL](https://www.postgresql.org/download/) | 15 | Or use Docker Compose (see below) |
| [Docker](https://docs.docker.com/get-docker/) | any recent | Optional — only needed for Docker-based PostgreSQL |
| [Node.js](https://nodejs.org/) | 18+ | Required only if you develop the React frontend |

---

## 1. Clone the repository

```bash
git clone https://github.com/barach6662001-bit/AgroPlatform.git
cd AgroPlatform
```

---

## 2. Start PostgreSQL

### Option A — Docker Compose (recommended)

```bash
docker-compose up -d
```

The Compose file starts a single `postgres:16-alpine` container with:

| Setting | Value |
|---------|-------|
| Database | `agroplatform_db` |
| User | `agroplatform` |
| Password | `agroplatform_dev` |
| Port | `5432` |

### Option B — Local PostgreSQL

Create a database and a user manually:

```sql
CREATE USER agroplatform WITH PASSWORD 'agroplatform_dev';
CREATE DATABASE agroplatform_db OWNER agroplatform;
```

---

## 3. Configure the application

Copy the example settings file and adjust if needed:

```bash
cp src/AgroPlatform.Api/appsettings.Development.example.json \
   src/AgroPlatform.Api/appsettings.Development.json
```

The default values in `appsettings.json` already match the Docker Compose database.
Edit `appsettings.Development.json` only if your credentials differ.

Key settings:

```jsonc
{
  "ConnectionStrings": {
    // PostgreSQL connection string
    "DefaultConnection": "Host=localhost;Port=5432;Database=agroplatform_db;Username=agroplatform;Password=agroplatform_dev"
  },
  "JwtSettings": {
    // Must be at least 32 characters
    "Key": "super-secret-key-for-development-minimum-32-characters-long!!"
  },
  "Swagger": {
    // Set to true to expose Swagger UI in non-Development environments
    "Enabled": true
  }
}
```

> **Never commit real secrets.** Use environment variables or user-secrets in production.

### Environment variables

Any configuration value can be overridden with an environment variable using double-underscore (`__`) as a separator:

```bash
export ConnectionStrings__DefaultConnection="Host=..."
export JwtSettings__Key="..."
export Swagger__Enabled=true
```

---

## 4. Apply database migrations

```bash
dotnet ef database update \
  --project src/AgroPlatform.Infrastructure \
  --startup-project src/AgroPlatform.Api
```

If `dotnet-ef` is not installed:

```bash
dotnet tool install --global dotnet-ef
```

---

## 5. Run the API

```bash
dotnet run --project src/AgroPlatform.Api
```

The API starts at **http://localhost:5224** (see `Properties/launchSettings.json`).

---

## 6. Open Swagger UI

Navigate to **http://localhost:5224/swagger** in your browser.

You will see all API endpoints grouped by module:

- **Auth** — register and log in
- **Warehouses** — stock management
- **Fields** — field and crop management
- **AgroOperations** — agricultural operation planning
- **Machinery** — fleet management
- **Economics** — cost tracking
- **Analytics** — dashboards and reports

To authenticate:

1. Call `POST /api/auth/login` with your credentials.
2. Copy the `token` value from the response.
3. Click **Authorize** (🔒) in Swagger UI.
4. Paste the token (without `Bearer ` prefix) and click **Authorize**.

---

## 7. Required request header — Tenant ID

Every request to protected endpoints must include:

```
X-Tenant-Id: <your-tenant-uuid>
```

See [tenancy.md](./tenancy.md) for details on multi-tenancy.

---

## 8. Run the frontend (optional)

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

The Vite dev server proxies `/api` requests to `http://localhost:5224`.

---

## 9. Run tests

```bash
# All tests
dotnet test

# Unit tests only
dotnet test tests/AgroPlatform.UnitTests

# Integration tests only (requires Docker for Testcontainers)
dotnet test tests/AgroPlatform.IntegrationTests
```

See the [project README](../README.md#-tests) for more details.
