# PR #1 Execution Plan: Task 046 - Multi-farm Support

**Branch**: `copilot/feattask-046-multi-farm-clean` (active)  
**Target**: Merge to `main`  
**Status**: 95% ready, need final verification

---

## 📋 DoD Checklist (Complete)

### Frontend
- [x] FarmSwitcher component exists (`frontend/src/components/Layout/FarmSwitcher.tsx`)
- [x] FarmSwitcher mounted in AppLayout header
- [x] Visible on topbar (between menu toggle and language selector)
- [x] authStore has `tenantId` field + `setTenantId()` method
- [x] authStore uses `persist` middleware (localStorage)
- [x] Load tenants from API: `getTenants()` in `frontend/src/api/tenants.ts`
- [x] Shows only if tenants.length > 1
- [ ] Verify: Non-admin see only their tenants
- [ ] Verify: Selection persists after page reload
- [ ] Verify: `npx tsc --noEmit` returns clean output
- [ ] Verify: `npm test -- --run` passes (zero errors)

### Backend
- [x] TenantMiddleware exists (`src/AgroPlatform.Api/Middleware/TenantMiddleware.cs`)
- [x] Validates X-Tenant-Id header on protected routes
- [x] Sets `context.Items["TenantId"]` for use in handlers
- [x] Tenant.cs entity exists (`src/AgroPlatform.Domain/Users/Tenant.cs`)
- [x] TenantsController exists with GET /api/tenants (returns user's tenants)
- [ ] Verify: Endpoint filters by current user (non-admin can't see others' tenants)
- [ ] Verify: All API queries use TenantId from context
- [ ] Verify: `dotnet build` succeeds
- [ ] Verify: `dotnet test` passes

### Integration
- [x] X-Tenant-Id axios interceptor (`frontend/src/api/axios.ts`)
- [x] Reads from: state.tenantId → localStorage → JWT claim
- [x] Appends to every API request
- [ ] Verify: Switching farm in UI → X-Tenant-Id header changes
- [ ] Verify: Isolated data per tenant (no cross-tenant leaks)
- [ ] Verify: Empty localStorage doesnt break (falls back to JWT)

### i18n
- [ ] Check if "Farm" label already in i18n (uk.ts + en.ts)
- [ ] If missing, this needs ADD

---

## 🔍 What to Verify Next

### 1. getTenants() filtering
**File**: `src/AgroPlatform.Api/Controllers/TenantsController.cs`

Check this getter filters by current user:
```csharp
[HttpGet]
public async Task<IActionResult> GetTenants()
{
  var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
  var tenants = await _context.UserTenants
    .Where(ut => ut.UserId == userId)
    .Select(ut => new TenantDto { Id = ut.Tenant.Id, Name = ut.Tenant.Name })
    .ToListAsync();
  return Ok(tenants);
}
```

❓ **Status**: Need to verify file exists and implements this

---

### 2. Non-admin tenant isolation
**File**: `src/AgroPlatform.Api/Controllers/TenantsController.cs` (or wherever queries happen)

All queries must filter by:
```csharp
var tenantId = context.Items["TenantId"] as Guid?;
.Where(x => x.TenantId == tenantId)
```

❓ **Status**: Need to verify all endpoints do this

---

### 3. i18n labels
**Files**: 
- `frontend/src/i18n/uk.ts`
- `frontend/src/i18n/en.ts`

Check if FarmSwitcher placeholder and label exist in translations:
```typescript
// uk.ts should have:
farm: { label: 'Ферма', selectPlaceholder: 'Виберіть ферму' }

// en.ts should have:
farm: { label: 'Farm', selectPlaceholder: 'Select farm' }
```

❓ **Status**: Need to check/add

---

## 🛠️ NEXT STEPS (For User to Execute)

### Step 1: Verify current state
```bash
cd /workspaces/AgroPlatform

# Check branch
git branch -v
# Expected: * copilot/feattask-046-multi-farm-clean

# See current changes
git status
```

### Step 2: Run all checks
```bash
# Frontend typechecking
cd frontend
npx tsc --noEmit

# Frontend tests
npm test -- --run

# Backend build
cd ..
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --configuration Release

# Backend tests
dotnet test
```

### Step 3: Manual testing (in browser)
1. Login as admin → see FarmSwitcher with multiple farms
2. Select farm A → X-Tenant-Id header changes to A
3. Navigate to any page → check DevTools Network tab
4. Reload page → farm selection persists
5. Login as non-admin → see only their farms in FarmSwitcher

### Step 4: If all green, commit
```bash
git add -A
git commit -m "fix(046): complete multi-farm support - FarmSwitcher wired + tenant isolation verified"
git push origin copilot/feattask-046-multi-farm-clean
```

### Step 5: Open PR and wait for CI
- Go to GitHub → New PR → `copilot/feattask-046-multi-farm-clean` → `main`
- Watch CI checks
- If all green → Merge (squash)

---

## 📌 Known Issues / Gaps to Fix (if found)

- [ ] FarmSwitcher shows even for single tenant (should hide per current code, but verify)
- [ ] Logout clears tenantId (correct behavior)
- [ ] Non-admin cannot switch tenants they don't have (need to verify backend enforces)

---

**Status**: Ready for user to run verification + commit + PR
