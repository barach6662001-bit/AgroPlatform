# Contributing to Agrotech

Thank you for your interest in contributing! This guide explains the workflow, conventions, and requirements for contributing to this project.

---

## Branch Workflow

All changes must go through a **pull request** targeting the `main` branch. Direct pushes to `main` are not allowed (see [docs/branch-protection.md](docs/branch-protection.md) for the required branch protection configuration).

1. Fork or clone the repository.
2. Create a new branch from the latest `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, commit them (see [Commit Message Format](#commit-message-format)), and push the branch.
4. Open a pull request against `main`.

---

## Branch Naming Conventions

Use the following prefixes to keep the branch list readable:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New features or enhancements |
| `fix/` | Bug fixes |
| `docs/` | Documentation-only changes |
| `chore/` | Maintenance, dependency updates, CI configuration |
| `refactor/` | Code restructuring without behavior changes |
| `test/` | Adding or improving tests |

Examples: `feature/machinery-export`, `fix/tenant-filter-null`, `docs/api-auth`

---

## Pull Request Requirements

Before a PR can be merged, the following conditions must be satisfied:

1. **At least 1 approving review** from a project maintainer.
2. **All CI checks must pass** (see [CI Checks](#ci-checks-that-must-pass)).
3. The branch must be **up to date with `main`** (rebase or merge `main` into your branch if needed).

Stale approvals are automatically dismissed when new commits are pushed to the PR branch.

---

## CI Checks That Must Pass

The CI pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request. Both jobs listed below must be green before merging:

| Job | Runtime | Steps |
|-----|---------|-------|
| `frontend-build-and-test` | Node.js 20 | `npm ci` → ESLint → `tsc -b` type-check → Vite build → Vitest tests |
| `build-and-test` | .NET 8.0 | `dotnet restore` → `dotnet build` (Release) → warn-as-error check → unit tests → integration tests → vulnerability scan → publish artifact |

Run the checks locally before pushing:

```bash
# Frontend
cd frontend
npm ci
npm run lint
npm run build
npm run test

# Backend
cd ..
dotnet build --configuration Release
dotnet test tests/AgroPlatform.UnitTests
dotnet test tests/AgroPlatform.IntegrationTests   # requires Docker
```

---

## Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

Supported types:

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `chore` | Build process, dependency updates, tooling |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or correcting tests |
| `ci` | Changes to CI/CD configuration |
| `perf` | Performance improvement |

Examples:
```
feat(machinery): add fuel-log export endpoint
fix(tenant): handle null TenantId in query filter
docs(contributing): add branch naming conventions
chore(deps): upgrade EF Core to 8.0.11
```

---

## Code Review Guidelines

When reviewing a pull request, please check the following:

- **Correctness** — does the code do what it says? Are edge cases handled?
- **Tests** — are there unit and/or integration tests for the changed behavior?
- **Security** — no secrets or credentials in code; input is validated; no new SQL injection vectors.
- **Multi-tenancy** — every new `AuditableEntity` must respect the tenant filter. New repositories should inject `ITenantService` or rely on `AppDbContext`'s automatic query filter.
- **Domain layer purity** — no infrastructure dependencies (`EF Core`, HTTP, etc.) in `AgroPlatform.Domain` or `AgroPlatform.Application`.
- **Warnings as errors** — the `Domain` and `Application` projects are compiled with `TreatWarningsAsErrors`. Ensure your changes introduce no new compiler warnings.
- **Style** — follow the existing code style; no unnecessary whitespace or unrelated formatting changes.

---

## Admin Setup

If you are a repository administrator, see [docs/branch-protection.md](docs/branch-protection.md) for instructions on enabling the required branch protection rules on `main`.

---

## UI: AntD → shadcn migration (in progress)

**Status:** Phase 0 complete. Ant Design and shadcn/ui coexist. Migration to shadcn
proceeds wave-by-wave (see `/design-system/MIGRATION_PLAN.md`).

### Rules

1. **New code: shadcn only.** Do not add new `antd` imports. If you think you need
   to, open a ticket referencing the gap and assign to design-system owner.
2. **Never mix AntD and shadcn in the same React component.** Z-index, portals,
   and focus rings fight each other. If a screen uses AntD Form, it must not also
   use shadcn Dialog — migrate the whole screen or stay on AntD until the screen
   is the next migration candidate.
3. **Migrate by route, not by component.** The unit of migration is an entire
   route subtree. Merging a half-migrated screen is not allowed.
4. **Tokens are law.** All colors, radii, shadows, font sizes come from
   `frontend/src/styles/tokens.css`. Do not inline hex values in components.
5. **Form stack:** react-hook-form + zod + shadcn Form. Validation schemas live
   under `src/domain/validation/`.
6. **Date format:** always `dd.MM.yyyy`, Ukrainian locale. Use
   `<DatePicker />` from `@/components/ui/date-picker`.
7. **Numbers:** always `Intl.NumberFormat('uk-UA')` + `font-mono tabular-nums` in
   tables.
8. **Toasts:** `toast.success/error/info` from sonner. Do not import AntD
   `message` or `notification` in new code.

### Preview route

`/__design-system` renders every primitive. Treat it as the acceptance test for
any DS change.

### Design system docs

- `/design-system/DESIGN_SYSTEM.md` — visual decisions, anti-patterns
- `/design-system/MIGRATION_PLAN.md` — strategy, component mapping, risk register
- `/design-system/tokens.css` — canonical token values
