# CLAUDE.md — Instructions for Claude Code

## Project: AgroTech — Farm Management Platform

### Tech Stack
- **Backend:** ASP.NET Core 8, Clean Architecture (Domain/Application/Infrastructure/Api), EF Core 8, PostgreSQL + PostGIS, MediatR, FluentValidation
- **Frontend:** React 18 + Vite + TypeScript, Ant Design, Zustand, React Router v6, Leaflet, i18n (uk.ts + en.ts)
- **DevOps:** Docker Compose, GitHub Actions CI

### Project Structure
```
src/AgroPlatform.Domain/          — Entities, Enums
src/AgroPlatform.Application/     — CQRS Commands/Queries, DTOs, Interfaces
src/AgroPlatform.Infrastructure/  — EF Core, Migrations, Services
src/AgroPlatform.Api/             — Controllers, Middleware
frontend/src/pages/               — Page components
frontend/src/components/          — Shared components
frontend/src/api/                 — Axios API calls
frontend/src/types/               — TypeScript interfaces
frontend/src/i18n/                — uk.ts and en.ts translations
```

### Build & Verify Commands
```bash
# Backend build
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release

# Frontend type check
cd frontend && npx tsc --noEmit && cd ..

# EF Core migration
dotnet ef migrations add <Name> --project src/AgroPlatform.Infrastructure --startup-project src/AgroPlatform.Api --output-dir Persistence/Migrations
```

### Commit Rules
- ALWAYS verify build before committing (both backend and frontend)
- Each task = one commit + push to main
- Format: `git add -A && git commit -m "message" && git push origin main`

### i18n Rules
- ALL keys added to uk.ts MUST also be added to en.ts
- Ukrainian is the primary language

### Important Patterns
- All entities inherit from AuditableEntity (has TenantId, IsDeleted, CreatedAtUtc, UpdatedAtUtc)
- Multi-tenancy via X-Tenant-Id header
- Soft delete via IsDeleted flag
- CostRecord is the central financial record: Category, Amount, Currency, Date, FieldId, AgroOperationId, Description
- Negative Amount in CostRecord = Revenue/Income

### Task Execution
Tasks are in the `tasks/` directory, numbered in order. Execute them sequentially:
1. Read the task file
2. Make the changes described
3. Verify build passes (both backend AND frontend)
4. Commit and push
5. Move to the next task

If a task fails build — fix the issue before moving on. Never skip a failing task.
