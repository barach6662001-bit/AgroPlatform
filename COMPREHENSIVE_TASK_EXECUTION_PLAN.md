# 🎯 Комплексный план выполнения всех 49 тасков

**Дата**: 24.03.2026  
**Цель**: Все таски → main с **приоритетом架構 стабильности**  
**Метод**: Layered execution (Foundation → Stability → Cleanup → Quality → Spatial → Features)

## 🏆 Optimization для архитектуры + стабильности:

✅ **Foundation first** (046, 044, 045, 047)  
→ Defines tenant boundaries, auth model, compliance baseline

✅ **Stability then** (042, 043, 017, 023)  
→ Prevents data loss, ensures reliability of critical systems

✅ **Cleanup before features** (014, 031, 034, 041)  
→ Remove duplication, tech debt, inconsistencies

✅ **Quality hardening** (003, 011, 018, 032-040)  
→ Fix audit findings on solid base

✅ **Spatial integrity** (020-029)  
→ Replace synthetic logic with real contracts

✅ **Operational features** (048, 049)  
→ Add integrations on proven foundation

---

## 📊 Состояние (из аудита)

| Статус | Количество | Таски |
|--------|-----------|-------|
| OK | 8 | 023, 030, 032, 033, 035, 036, 038, 039 |
| PARTIAL | 30 | 003, 011, 014, 020-022, 024-029, 031, 034, 037, 040, 042-045 |
| BROKEN | 2 | 017, 046 |
| FAKE-DONE | 1 | 041 |

---

## 🚨 ФАЗА 1: CRITICAL STABILIZATION (S1)

Эти 6 задач должны быть переделаны полностью:

### 1️⃣ **TASK 046: Multi-farm support (BROKEN → OK)**
**Current branch**: `copilot/feattask-046-multi-farm-clean`

**Problems**:
- FarmSwitcher component exists but NOT mounted in header
- Non-admin users get one tenant only
- "Multi-farm" appears implemented but unusable

**Fix**:
1. Mount FarmSwitcher in Header.tsx
2. Implement user-tenant mapping model
3. Add persistence/localStorage for farm selection
4. Protect endpoints with tenant isolation
5. Add tests for tenant switching

**DoD Checklist**:
- [ ] FarmSwitcher visible in header
- [ ] Farm switching changes X-Tenant-Id header
- [ ] Non-admin can see only their tenants
- [ ] Selection persists on reload
- [ ] All API calls get tenant-scoped isolation
- [ ] Tests: switch → request has correct tenant
- [ ] `npx tsc --noEmit` clean
- [ ] `npm test -- --run` passes
- [ ] `dotnet build` passes

**Branch**: `fix/task-046-multifarm-hardening`  
**PR Title**: `fix: complete multi-farm support - mount FarmSwitcher + user-tenant mapping`

---

### 2️⃣ **TASK 044: Role-permission matrix (PARTIAL → OK)**

**Problems**:
- Claimed Permission entity/API/admin UI does NOT exist
- Only static hardcode in code
- Role strings inconsistent

**Fix**:
1. Create Domain/Security/Permission.cs entity
2. Create migrations
3. Create CRUD handlers + API endpoints
4. Create PermissionMatrix admin page
5. Implement source-of-truth for role/permissions

**DoD Checklist**:
- [ ] Permission entity with RoleId, Module, CanRead/Create/Update/Delete
- [ ] EF migration created + validated
- [ ] GET /api/permissions endpoints wired
- [ ] POST/PUT /api/permissions crud endpoints
- [ ] Admin page at /admin/permissions with checkbox matrix
- [ ] Sidebar "Админ > Дозволи" entry
- [ ] i18n keys added (uk.ts + en.ts)
- [ ] Policy generation works from DB
- [ ] Tests for role/permission validation
- [ ] `npx tsc --noEmit` clean
- [ ] All tests pass (zero warnings)
- [ ] `dotnet build` passes

**Branch**: `feat/task-044-permission-matrix`  
**PR Title**: `feat: persistent permission matrix + admin UI`

---

### 3️⃣ **TASK 043: Push notifications (PARTIAL → OK)**

**Problems**:
- Subscribe UI exists but NO delivery pipeline
- No FCM/WebPush sender service
- No delivery logs/metrics

**Fix**:
1. Create PushNotificationService (backend)
2. Implement FCM/WebPush sender
3. Add delivery retries + cleanup for failed subscriptions
4. Create delivery telemetry
5. Wire NotificationCreated → push delivery

**DoD Checklist**:
- [ ] PushNotificationService implemented
- [ ] Firebase/WebPush credentials setup documented
- [ ] Notification creation triggers push delivery
- [ ] Retry logic with exponential backoff
- [ ] Invalid tokens cleaned up
- [ ] Delivery logs in app insights/telemetry
- [ ] Tests: notification → message delivered
- [ ] UI shows delivery status (pending/sent/failed)
- [ ] `npx tsc --noEmit` clean
- [ ] `dotnet build` + test passes

**Branch**: `feat/task-043-push-delivery`  
**PR Title**: `feat: end-to-end push notification delivery pipeline`

---

### 4️⃣ **TASK 042: Offline mode (PARTIAL → OK)**

**Problems**:
- Queue not globally wired via interceptor
- Retry/backoff/conflict resolution primitive
- Data loss risk on reconnect

**Fix**:
1. Wire IndexedDB queue to Axios interceptor for ALL mutating requests
2. Implement deterministic replay policy
3. Add conflict detection (optimistic lock / timestamp)
4. Implement merge strategy for conflicts
5. Add offline UX indicator per operation

**DoD Checklist**:
- [ ] API interceptor queues all POST/PUT/DELETE when offline
- [ ] Queue replays in order on reconnect
- [ ] Conflict detection via version/timestamp
- [ ] Merge strategy: server-wins or show conflict UI
- [ ] UI shows (Offline) status on affected rows
- [ ] Retry with exponential backoff
- [ ] Tests: offline → edit → online → verify sync
- [ ] Tests: conflict scenario → resolution
- [ ] `npx tsc --noEmit` clean
- [ ] All tests pass

**Branch**: `feat/task-042-offline-sync-hardening`  
**PR Title**: `feat: robust offline sync with conflict handling`

---

### 5️⃣ **TASK 017: Skeleton loaders (BROKEN → OK)**

**Problems**:
- TableSkeleton exists but most pages still use Spin/loading
- No global standard
- Inconsistent UX

**Fix**:
1. Enhance TableSkeleton with column count + row count config
2. Create DeleteConfirmButton shared component
3. Migrate all table pages to use TableSkeleton (not Spin)
4. Standardize all Popconfirm delete dialogs
5. Add i18n for all delete messages

**DoD Checklist**:
- [ ] All table pages use TableSkeleton (zero raw Spin usage)
- [ ] DeleteConfirmButton component created + exported
- [ ] All delete buttons use DeleteConfirmButton
- [ ] All delete messages in i18n (no hardcoded strings)
- [ ] Skeleton shows correct column count + row count
- [ ] Tests for loading state rendering
- [ ] `npx tsc --noEmit` clean
- [ ] `npm test -- --run` passes

**Branch**: `refactor/task-017-unified-loading`  
**PR Title**: `refactor: unified skeleton loaders + delete dialogs`

---

### 6️⃣ **TASK 041: Economics unification (FAKE-DONE → OK)**

**Problems**:
- Task ledger mismatch (says QR fuel, means economics)
- Duplicated dashboards (Economics + Analytics)
- No single source of truth

**Fix**:
1. Create shared economics domain/module
2. Extract common DTO/Query patterns
3. Unify dashboard components
4. Create single route/sidebar entry OR clearly document why two dashboards
5. Align all cost/revenue calculations

**DoD Checklist**:
- [ ] Shared EconomicsModule created
- [ ] Common DTO pattern documented
- [ ] Dashboard duplication resolved (merge or document)
- [ ] Single calculation logic for earnings
- [ ] All economics pages use shared module
- [ ] i18n aligned across all pages
- [ ] Tests for calculation correctness
- [ ] `npx tsc --noEmit` clean

**Branch**: `refactor/task-041-economics-unification`  
**PR Title**: `refactor: unified economics module - remove duplication`

---

## 📈 ФАЗА 2: OK TASKS HARDENING (30 + 8 = 38)

Таски со статусом OK и большинство PARTIAL могут быть hardened параллельно в меньших PR:

### Группа A: UI/UX Fixes (LOW RISK)
- **003**: Remove dead warehouse fetch + add telemetry
- **011**: Add revenueSource field + localize print
- **014**: Centralize breakpoints + CSS refactor
- **018**: Shared DeleteConfirmButton (overlaps с 017)
- **031**: Unify marginality dashboards

**Branch pattern**: `fix/task-XXX-hardening`

### Группа B: Analytics (MEDIUM RISK)
- **032**: i18n for month labels
- **033**: Fix test mocks (zero xhr warnings)
- **034**: Fix AntD deprecations + act warnings
- **035**: Add completeness metadata
- **036**: Add sensitivity analysis
- **037**: Crop taxonomy normalization
- **038**: Month formatter localization

**Branch pattern**: `feat/task-XXX-analytics-hardening`

### Группа C: Spatial/Satellite (HIGH RISK - requires testing)
- **020**: Move to CQRS + feature flag
- **021**: Numeric NDVI detection
- **022**: Real date catalog
- **024**: Strict webhook contract
- **025**: Central geofence service
- **026**: Geometry validators
- **027**: Zone binding UI
- **028**: Spatial prescription map
- **029**: Stable tile proxy

**Branch pattern**: `feat/task-XXX-spatial-hardening`

### Группа D: Mobile/Connectivity (HIGH RISK)
- **040**: Robust mobile inspection pipeline
- **045**: Structured audit trail
- **023**: Snapshot + reconciliation endpoint

**Branch pattern**: `feat/task-XXX-mobile-hardening`

---

## ✅ ФАЗА 3: NEW BIG FEATURES (3)

### TASK 047: Public API keys + webhooks
**Depends on**: S1 complete (046, 044, 043, 042)  
**Branch**: `feat/task-047-public-api-keys`

### TASK 048: 1C export
**Depends on**: 047 + analytics hardened  
**Branch**: `feat/task-048-1c-export`

### TASK 049: Marketing landing page
**Depends on**: None (parallel)  
**Branch**: `feat/task-049-landing-page`

---

## 🔄 MERGE STRATEGY

### Per-PR Merge Gate:
1. ✅ `npx tsc --noEmit` clean
2. ✅ `npm test -- --run` (zero xhr, zero act warnings)
3. ✅ `dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release`
4. ✅ `dotnet test`
5. ✅ Route/sidebar/i18n/API checklist reviewed
6. ✅ Contract diff FE types ↔ BE DTOs matched
7. ✅ Reviewer approval
8. ✅ CI green
9. ✅ Squash merge to main

### Blocked PRs:
- Any task touching auth/permission/tenant without manual review
- Any financial/export logic without compliance check
- Any offline/webhook without edge case validation

---

## 📋 EXECUTION ORDER (ARCHITECTURE-FIRST)

### 🏗️ LAYER 1: FOUNDATION (Data isolation + Auth source-of-truth)
```
→ Gives all other layers solid boundaries and auth model
→ If wrong here, everything above is fragile

  1. task-046 (Multi-farm tenant isolation)
     └─ X-Tenant-Id propagation, FarmSwitcher UX, user-tenant mapping
  
  2. task-044 (Permission matrix as source-of-truth)
     └─ DB-backed roles, admin UI, policy generation
  
  3. task-045 (Audit trail - queryable + structured)
     └─ Enables compliance + forensics for all layers above
  
  4. task-047 (API keys + auth model hardening)
     └─ Replaces ad-hoc auth, scoped permissions, webhook signatures
```
**Why now**: These define boundaries. Everything else inherits them.

---

### 🔒 LAYER 2: STABILITY (Critical systems robust)
```
→ Strengthens reliability + data consistency
→ Prevents data loss / silent failures / inconsistency

  5. task-042 (Offline sync with conflict resolution)
     └─ Robust replay, conflict detection, merge strategy
  
  6. task-043 (Push delivery end-to-end)
     └─ Real FCM/WebPush sender, retries, invalid token cleanup
  
  7. task-017 (Unified loading + delete confirmation)
     └─ TableSkeleton + DeleteConfirmButton = UX consistency + dead code removal
  
  8. task-023 (GPS reconnect resilience)
     └─ Snapshot endpoint + periodic reconciliation
```
**Why now**: These prevent data loss and inconsistency. Foundation must be solid before this.

---

### 🧹 LAYER 3: ARCHITECTURE CLEANUP (Remove duplication + debt)
```
→ Reduces maintenance burden + fragility from drift
→ Consolidates weak patterns

  9. task-041 (Economics unification - remove dashboard duplication)
     └─ Shared module, single DTO pattern, clear source-of-truth
  
  10. task-031 (Marginality dashboard consolidation)
      └─ Merge/disambiguate duplicate analytics views
  
  11. task-014 (Centralized breakpoints + responsive tokens)
      └─ Design system + normalized inline styles
  
  12. task-034 (Fix AntD deprecations + test warnings)
      └─ Removes act() warnings, uses current AntD API
  
  13. task-045 (Part 2: Audit coverage automation)
      └─ Declarative decorator-based entity tracking
```
**Why now**: Foundation + Stability solid → refactor safely without regression risk.

---

### 📊 LAYER 4: QUALITY HARDENING (Fix known gaps)
```
→ Address concrete audit findings

  14. task-003 (Remove dead warehouse fetch + telemetry)
  15. task-011 (Add revenueSource field + i18n print)
  16. task-018 (Shared DeleteConfirmButton - consolidated delete UX)
  17. task-032 (i18n month labels in analytics)
  18. task-033 (Fix test mocks - zero xhr leakage)
  19. task-035 (Add completeness metadata per year)
  20. task-036 (Sensitivity analysis for break-even)
  21. task-037 (Crop taxonomy normalization)
  22. task-038 (Month formatter locale-aware)
  23. task-039 (Document offline strategy per page)
  24. task-040 (Robust mobile inspection pipeline)
```
**Why now**: Foundation + Stability + Architecture clean → these fixes won't be overridden.

---

### 🗺️ LAYER 5: SPATIAL INTEGRITY (Real vs synthetic features)
```
→ Replace heuristic/placeholder logic with real data

  25. task-020 (Move Sentinel to CQRS + feature flag)
  26. task-021 (Numeric NDVI detection vs RGB heuristic)
  27. task-022 (Real date catalog vs synthetic)
  28. task-024 (Strict webhook contract for GPS)
  29. task-025 (Central geofence service + deterministic dedup)
  30. task-026 (Geometry validators + topology rules)
  31. task-027 (Zone binding UI + agronomic validation)
  32. task-028 (Spatial prescription map + export)
  33. task-029 (Stable tile proxy + defensive layer detection)
```
**Why now**: Earlier layers stable → can hardening spatial logic without disrupting core.

---

### ✨ LAYER 6: OPERATIONAL FEATURES (New capabilities)
```
→ Build on solid foundation

  34. task-048 (1C export with versioned schema)
  35. task-049 (Marketing landing page)
```
**Why now**: All foundation layers complete → integration features safe to add.

```

**Total**: ~35 PRs (layered by dependency + architecture maturity)

**Merge sequence**: Sequential (each layer validates previous) + periodic stabilization passes

---

---

## ⚙️ FOR AGENT EXECUTION (Architecture-first discipline)

### LAYER 1 (Foundation): MANUAL REVIEW ONLY
❌ Agent cannot execute these autonomously  
✅ Requires:
- Security architect review (tenant isolation)
- Database schema validation (auth model)
- API contract review (all downstream depends)

**What agent CAN do**: Implement per exact spec, unit tests, documentation

---

### LAYER 2 (Stability): MANUAL REVIEW + AGENT
❌ Agent creates PR, but MUST have:
- Offline sync: manual edge case validation (conflict scenarios)
- Push delivery: manual credential/integration setup
- Loading: agent can do, straightforward refactor

**What agent CAN do**: Implement changes, write tests, flag manual checkpoints

---

### LAYER 3 (Architecture): AGENT + DESIGN REVIEW
✅ Agent can work mostly autonomously, but:
- Duplication removal: needs architecture review (did we consolidate correctly?)
- Deprecation fixes: straightforward
- Debt cleanup: agent can do

**What agent CAN do**: Full implementation if given clear module boundaries

---

### LAYER 4+ (Quality/Spatial/Operational): MOSTLY AGENT

✅ Agent mostly autonomous if:
- Clear API contracts provided
- Test examples given
- Edge cases documented

---

## 🎯 AGENT WORKFLOW (Per PR)

1. **Read task + audit findings** → understand exact "definition of real completion"
2. **Check DoD checklist** → ensure no missing wiring (route/sidebar/i18n/backend)
3. **Implement changes** → code first, tests follow
4. **Local validation** → run all 5 pre-merge checks locally
5. **Flag manual spots** → if Layer 1/2, note what needs manual review
6. **Create PR + description** → include contract snapshot + what was NOT implemented
7. **Wait for review** → don't merge until approved

---

## 📍 CURRENT STATE

## 🏛️ ARCHITECTURAL PRINCIPLES (Why this order matters)

### Layered Dependency Model

```
FEATURES (048, 049)
  ↑ depends on
SPATIAL (020-029)
  ↑ depends on
QUALITY (003-040)
  ↑ depends on
CLEANUP (014, 031, 034, 041, 045)
  ↑ depends on
STABILITY (042, 043, 017, 023)
  ↑ depends on
FOUNDATION (046, 044, 045, 047)
```

### Why this prevents fragility:

| Layer | Risk if wrong | Cost of late changes |
|-------|--------------|----------------------|
| **FOUNDATION** | Loss of isolation, auth issues, data leakage | Touches everything → full regression test |
| **STABILITY** | Data loss, inconsistency, offline failure | Every sync/notification/loading page affected |
| **CLEANUP** | Hidden bugs in redirected code, duplicated fixes | Divergence grows exponentially |
| **QUALITY** | Incomplete features, telemetry gaps | Harder to find root causes later |
| **SPATIAL** | User trust erosion, fake analytics | Difficult to swap real APIs later |
| **FEATURES** | Unsupported use cases | Largest feature can't be added safely |

### Architecture anti-patterns we're avoiding:

❌ **"Ship features first, stabilize later"** → Results in technical debt compounding  
✅ **"Build foundation, then add features"** → Each layer validates lower layers

❌ **"Auth model can be loose, we'll refactor"** → Auth model drift multiplies across system  
✅ **"Auth as foundational contract"** → Everything else inherits strict boundaries

❌ **"Offline sync can be simple, retry on error"** → Leads to data loss / duplicates  
✅ **"Offline is stability system"** → Conflict handling + replay semantics baked in early

❌ **"We'll consolidate code later"** → Duplication becomes architectural  
✅ **"Remove duplication before adding features"** → New features inherit clean patterns

---

## 📊 STABILITY METRICS (Track improvement across layers)

After each layer, measure:

```
Layer 1 (Foundation):
  ✓ Tenant isolation verified (no cross-tenant data leaks)
  ✓ Auth model enforced (policy decisions consistent)
  ✓ Audit trail complete (all mutations recorded)

Layer 2 (Stability):
  ✓ Offline queue deterministic (replay semantics proven)
  ✓ Push delivery reliable (no silent failures)
  ✓ Loading UX consistent (no Spin vs Skeleton drift)

Layer 3 (Architecture):
  ✓ Code duplication reduced (single source per concept)
  ✓ Deprecation warnings eliminated
  ✓ Test warnings cleared

Layer 4 (Quality):
  ✓ No dead code in changed scopes
  ✓ All promises chained/awaited
  ✓ No hardcoded strings outside i18n

Layer 5 (Spatial):
  ✓ No synthetic/placeholder data in production
  ✓ Contracts with satellites/GPS vendors verified
  ✓ Degraded mode observable + documented

Layer 6 (Operational):
  ✓ 1C export reconciliation proven
  ✓ Landing page analytics wired correctly
```

---

- **Active branch**: `copilot/feattask-046-multi-farm-clean`
- **Target**: All PRs merge to `main`
- **CI**: Must be green on all PRs
- **Lockfile**: Keep `frontend/package-lock.json` in sync

---

**Next**: Ready to start? Begin with **TASK 046**?
