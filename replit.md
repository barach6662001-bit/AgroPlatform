# AgroPlatform — Replit Setup

## Overview
AgroPlatform is a farm management platform with:
- **Backend**: .NET 8 ASP.NET Core Web API (Clean Architecture) requiring PostgreSQL + PostGIS — not run in Replit dev environment due to heavy infra requirements (Postgres/PostGIS).
- **Frontend**: React 18 + Vite + TypeScript + Ant Design — runs in Replit on port 5000.
- **Mobile**: Expo (not configured for Replit).

## Replit Workflow
- `Start application`: runs `cd frontend && npm run dev` on port 5000 (Vite dev server, host `0.0.0.0`, `allowedHosts: true` so the Replit iframe proxy works).

## Frontend
- Located in `frontend/`.
- Vite config (`frontend/vite.config.ts`) is set to host `0.0.0.0`, port `5000`, with all hosts allowed.
- API requests are proxied from `/api` to `http://localhost:8080` (the .NET backend, when running).

## Deployment
Configured as a **static** deployment:
- Build: `cd frontend && npm install && npm run build`
- Public directory: `frontend/dist`

## Backend (not configured in Replit)
The .NET 8 backend (`src/AgroPlatform.Api`) requires PostgreSQL + PostGIS and is intended to run via Docker Compose locally or in production. To run it, follow the `README.md` and `docker-compose.yml` instructions in a Docker-capable environment.
