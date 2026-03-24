# 🏛️ Architecture & Stability Strategy

**Why layered execution prevents catastrophic drift**

---

## Problem Statement (From Audit)

Current state:
- ✅ **Broad** feature coverage (49 tasks)
- ✅ **Present** implementations exist
- ❌ **Fragility**: Many features are PARTIAL/FAKE-DONE or weakly integrated
- ❌ **Drift**: Task ledger doesn't match code (041 mismatch)
- ❌ **Architecture**: Duplication, weak contracts, synthetic behavior presented as complete

**Risk**: Adding features without fixing foundation = exponential complexity at scale.

---

## The Layering Model (Why it matters)

### Layer 1: FOUNDATION (Auth + Data Isolation)

**What it does**: Defines the security boundary and multi-tenant contract.

**Tasks**:
- **046**: Multi-farm UX + user-tenant mapping
- **044**: Permission matrix as DB source-of-truth
- **045**: Audit trail (queryable, structured)
- **047**: API keys + auth model hardening

**Why FIRST**:
- If tenant isolation is wrong → data leaks across all layers
- If auth model is loose → every feature after inherits the weakness
- If audit is missing → compliance failures cascade

**Cost of change in Layer 2+**: 
- Multi-tenant bug found in Layer 5? → Must re-validate all 4 layers
- Permission model change in Layer 3? → All Layer 4+ features potentially affected
- → Regression testing becomes exponential

---

### Layer 2: STABILITY (Reliability of Critical Systems)

**What it does**: Ensures no data loss, silent failures, or inconsistencies.

**Tasks**:
- **042**: Offline sync with conflict resolution
- **043**: Push delivery end-to-end (not subs-only)
- **017**: Unified loading + delete UX
- **023**: GPS reconnect resilience

**Why AFTER Foundation**:
- Offline replay must respect tenant boundaries (Foundation)
- Push delivery must respect auth/scoping (Foundation)
- Loading spinners interact with auth states (Foundation)

**Cost of wrong order**:
- Offline sync without auth model → can sync wrong tenant's data
- Push without permission model → can notify wrong users
- Loading states before cleanup → UX inconsistency compounds

---

### Layer 3: ARCHITECTURE CLEANUP (Remove Duplication)

**What it does**: Consolidate similar modules, remove patterns that drift over time.

**Tasks**:
- **041**: Economics module unification (remove dashboard duplication)
- **031**: Marginality consolidation
- **014**: Design tokens + responsive system
- **034**: Remove deprecation warnings
- **045** (part 2): Automated audit entity tracking

**Why AFTER Stability**:
- Consolidating modules while stability issues exist → refactor might need re-doing
- Merging dashboards while they diverge → harder to decide "which one is right"
- Removing code duplication → easier if patterns are already proven stable

**Cost of wrong order**:
- Refactor duplication too early → might refactor the wrong pattern
- Add features before consolidation → new features inherit duplication
- → Technical debt becomes architectural (exponential to fix)

---

### Layer 4: QUALITY HARDENING (Fix Known Gaps)

**What it does**: Address specific audit findings on proven base.

**Tasks**:
- 003: Remove dead code + telemetry
- 011: Add revenueSource field
- 018: Shared DeleteConfirmButton
- 032-040: Analytics hardening, mobile, UX fixes

**Why AFTER Cleanup**:
- Fix applied to consolidated module, not duplicate
- Telemetry added to stable patterns, not ones being refactored
- Mobile fixes on solid offline/auth model

---

### Layer 5: SPATIAL INTEGRITY (Real vs Synthetic)

**What it does**: Replace heuristic logic with real vendor contracts.

**Tasks**:
- 020-022: Sentinel integration (real dates, numeric NDVI)
- 024-029: GPS webhooks, geofence, zones, soil analysis, prescription maps

**Why AFTER Quality**:
- Spatial features depend on stable data model (Layer 4 cleanup)
- Coordinates/geometries flow through stable APIs (Layer 2 reliability)
- User isolation proven before multi-farm field/zone data (Layer 1 foundation)

**Cost of wrong order**:
- Add spatial features before stable audit → hard to audit spatial mutations
- Spatial changes while offline model incomplete → conflict handling gaps
- → Hard to trust analytics data

---

### Layer 6: OPERATIONAL FEATURES (New Capabilities)

**What it does**: Add integrations that depend on all lower layers.

**Tasks**:
- **048**: 1C export (versioned schema, accounting safe)
- **049**: Marketing landing page

**Why LAST**:
- 1C export depends on stable financial data (Layers 2-4)
- Export depends on permission model (Layer 1)
- Landing page can be standalone (Layer 0)

---

## Anti-patterns We're Avoiding

### ❌ Pattern 1: "Ship features first, stabilize later"

**Result**: 
```
Feature A added   → Foundation weak
Feature B added   → Depends on weak Foundation
Feature C added   → Depends on B which depends on weak Foundation
...
Technical debt = O(n²)
```

**Fixed by**: Build Foundation, then stack Features

---

### ❌ Pattern 2: "Auth/Permission model can be loose"

**Result**:
```
Auth in Layer 1  → loose
Feature in Layer 3 → assumes tight auth → works sometimes
Feature in Layer 5 → different auth assumption → breaks
Users see inconsistency
```

**Fixed by**: Auth as Layer 1 contract, all features inherit strict model

---

### ❌ Pattern 3: "We'll consolidate code later"

**Result**:
```
Dashboard A created (Layer 4)
Dashboard B created (Layer 5)  → similar to A, but subtly different
Fix in A → B still broken
Sync becomes nightmare
```

**Fixed by**: Consolidate BEFORE building on top

---

### ❌ Pattern 4: "Offline sync can be simple"

**Result**:
```
User edits offline
Reconnects
Server has different state
Silent overwrite → data loss
```

**Fixed by**: Conflict handling in Layer 2 (before all features depend on offline)

---

## Stability Metrics (Track Progress)

### After Layer 1 (Foundation)
- ✅ Zero cross-tenant data visible
- ✅ Permission model enforced on 100% of endpoints
- ✅ Audit trail captures all mutations
- ✅ API key scoping prevents escalation

### After Layer 2 (Stability)
- ✅ Offline queue deterministic (no data loss seen in testing)
- ✅ Push delivery proven end-to-end (Firebase/WebPush functional)
- ✅ Loading UX unified (no Spin vs Skeleton inconsistency)
- ✅ GPS reconnect shows state after refresh

### After Layer 3 (Architecture)
- ✅ Code duplication < 10% (was > 30%)
- ✅ Zero deprecation warnings in console
- ✅ All tests pass without act() warnings
- ✅ 100% of components typed (no any)

### After Layer 4 (Quality)
- ✅ Dead code removed from all changed scopes
- ✅ Telemetry added to high-risk operations
- ✅ All promises properly chained
- ✅ Mobile inspection flow tested end-to-end

### After Layer 5 (Spatial)
- ✅ No synthetic dates in NDVI timeline
- ✅ Geofence alerts use PostGIS, not string matching
- ✅ Soil samples linked to zones
- ✅ Prescription map renders on Leaflet

### After Layer 6 (Operational)
- ✅ 1C export reconciliation proven
- ✅ Landing page GA4 events wired
- ✅ All 49 tasks merged to main
- ✅ Zero blocking issues in production

---

## Risk Matrix (What breaks if Layer N is wrong)

| Layer | If wrong in Layer... | Impact on Layers Below | Impact on Layers Above |
|-------|----------------------|----------------------|----------------------|
| 1 | Foundation | N/A | All (6 layers, exponential break) |
| 2 | Stability | —(1 layer) | 4 layers |
| 3 | Architecture | —(2 layers) | 3 layers |
| 4 | Quality | —(3 layers) | 2 layers |
| 5 | Spatial | —(4 layers) | 1 layer |
| 6 | Operational | —(5 layers) | N/A |

**Read as**: Foundation error breaks 60 things. Operational error breaks 0.

---

## Execution Discipline (Why we're strict)

### Per Layer:
1. ✅ **Code complete** → all PR changes merged
2. ✅ **Tests pass** → zero warnings, all cases covered
3. ✅ **Architecture review** → patterns solid, no shortcuts
4. ✅ **Metrics validated** → measure from checklist above
5. ✅ **Documentation updated** → contracts clear for next layer

### Between Layers:
- **No skipping** → Layer N+1 cannot start until N metrics all green
- **Stabilization pass** → After each layer, address any warnings/tech debt
- **Regression tests** → Every layer validates Layer N still works

---

## Timeline Estimate

- **Layer 1** (Foundation): ~4-5 PRs, 4-5 days
- **Layer 2** (Stability): ~4-5 PRs, 3-4 days
- **Layer 3** (Cleanup): ~5-6 PRs, 2-3 days
- **Layer 4** (Quality): ~11-13 PRs, 4-5 days
- **Layer 5** (Spatial): ~9 PRs, 4-5 days
- **Layer 6** (Operational): ~2 PRs, 2 days

**Total**: ~35 PRs, ~22-25 days (conservative, with reviews)

---

## What we're NOT doing

❌ Shipping many features at once  
✅ Build proven foundation, stack carefully

❌ Auth model loose or "we'll fix later"  
✅ Auth tight from Layer 1

❌ Overlapping duplication  
✅ One consolidation before new features

❌ Synthetic behavior presented as done  
✅ Real contracts verified layer by layer

---

## Expected outcome

After all layers:
- ✅ **46 tasks hardened** (3 remain: 001, 002, landing page)
- ✅ **Architecture solid** (no duplication, patterns consistent)
- ✅ **Stability proven** (offline, push, auth all deterministic)
- ✅ **Compliance ready** (audit trail, permissions, isolation)
- ✅ **Scale-ready** (can add 10x more users/data without architectural change)
