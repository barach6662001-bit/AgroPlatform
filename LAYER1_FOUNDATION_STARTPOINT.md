# 🚀 Начало работы: Layer 1 (Foundation) Startpoint

**Готовы начать? Вот точно что делать.**

---

## 📍 Current State Check

```bash
# Verify current branch
git branch -v
# Expected: * copilot/feattask-046-multi-farm-clean

# Check uncommitted changes
git status
# Should be clean for safe reset to main if needed
```

---

## 🎯 Layer 1 Attack Plan (6 PRs → main)

### PR #1: TASK 046 — Multi-farm UX complete wiring

**Current branch**: `copilot/feattask-046-multi-farm-clean` ← USE THIS

**What needs to happen**:

1. **FarmSwitcher mount** in Header.tsx
   ```tsx
   // frontend/src/components/Layout/Header.tsx
   // Add after Logo, before User menu:
   <FarmSwitcher />
   ```

2. **User-tenant mapping** stored + persisted
   - Get user's farms from `/api/tenants`
   - Store selected farm in localStorage
   - Read on app init

3. **X-Tenant-Id propagation**
   - Already in axios interceptor (check)
   - Verify on every API call

4. **Non-admin isolation**
   - Non-admins see only their tenants
   - Cannot switch to farm they don't have access to

5. **Tests**
   - Switch farm → X-Tenant-Id header changes
   - API call includes correct tenant
   - Non-admin cannot access other tenant's endpoints

**DoD Checklist**:
- [ ] FarmSwitcher visible in Header
- [ ] Selection persists on page reload
- [ ] Non-admin sees only their farms
- [ ] X-Tenant-Id correct on all requests
- [ ] Tests pass (farm switching flow)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm test -- --run` passes

**Action**: 
1. Read [/workspaces/AgroPlatform/COMPREHENSIVE_TASK_EXECUTION_PLAN.md](COMPREHENSIVE_TASK_EXECUTION_PLAN.md) → Task 046 section
2. Check current Header.tsx for FarmSwitcher presence
3. Implement + commit + push
4. Open PR to main

---

### PR #2: TASK 044 — Permission matrix (DB source-of-truth)

**Depends on**: PR #1 merged

**What needs to happen**:

1. **Create Permission entity** (`src/AgroPlatform.Domain/Security/Permission.cs`)
   ```csharp
   public class Permission : AuditableEntity
   {
       public Guid RoleId { get; set; }
       public string Module { get; set; } // e.g., "Operations", "Economics"
       public bool CanRead { get; set; }
       public bool CanCreate { get; set; }
       public bool CanUpdate { get; set; }
       public bool CanDelete { get; set; }
   }
   ```

2. **Create EF migration**
   ```bash
   dotnet ef migrations add AddPermissions --project src/AgroPlatform.Infrastructure --startup-project src/AgroPlatform.Api
   ```

3. **Create handlers**
   - GetPermissionsQuery / GetPermissionsHandler
   - UpdatePermissionsCommand / UpdatePermissionsHandler

4. **Create API endpoints**
   - GET /api/permissions/{roleId}
   - PUT /api/permissions

5. **Create admin page** (`frontend/src/pages/Admin/PermissionMatrix.tsx`)
   - Fetch permissions from API
   - Show checkbox matrix (Role × Module × Action)
   - Save changes

6. **Add sidebar entry**
   - Routes: `/admin/permissions`
   - i18n: `admin.permissions` in uk.ts + en.ts

7. **Tests**
   - Get permissions for role
   - Update permissions
   - Verify policy enforced on endpoints

**DoD Checklist**:
- [ ] Permission entity created + migrated
- [ ] GET/PUT endpoints wired
- [ ] Admin page shows matrix
- [ ] Sidebar "Админ > Дозволи" entry
- [ ] Policy validation works
- [ ] i18n keys present (uk + en)
- [ ] Tests pass
- [ ] `npx tsc --noEmit` clean

**Action**:
1. Read domain entity requirements
2. Create entity + migration + handlers
3. Wire API
4. Create admin page + sidebar entry
5. Commit + push PR

---

### PR #3: TASK 045 — Audit trail (queryable + structured)

**Depends on**: PR #1 + PR #2 merged (foundation solid)

**What needs to happen**:

1. **Enhance AuditEntry entity**
   ```csharp
   public class AuditEntry
   {
       public Guid Id { get; set; }
       public Guid UserId { get; set; }
       public Guid TenantId { get; set; }  // ← ADD (tenant isolation)
       public DateTime CreatedAtUtc { get; set; }
       public string EntityType { get; set; }
       public Guid EntityId { get; set; }
       public string Action { get; set; } // Created, Updated, Deleted
       public string OldValues { get; set; } // JSON diff
       public string NewValues { get; set; } // JSON diff
   }
   ```

2. **Create migration** with TenantId + JSON fields

3. **Update interceptor** to capture OldValues/NewValues

4. **Create API endpoint**
   - GET /api/audit?entityType=&tenantId=&userId=
   - Queryable with filters

5. **Create Audit Log page** (`frontend/src/pages/Admin/AuditLog.tsx`)
   - Table with User, Entity, Action, Timestamp, Changes
   - Filters

6. **Tests**
   - Audit entry captures changes
   - Tenant isolation in audit trail
   - Query filters work

**DoD Checklist**:
- [ ] AuditEntry has TenantId + structured JSON
- [ ] Migration applied
- [ ] Interceptor captures old/new values
- [ ] API endpoint queryable
- [ ] Admin page shows audit trail
- [ ] Sidebar entry
- [ ] Tests pass
- [ ] `npx tsc --noEmit` clean

---

### PR #4: TASK 047 — API keys + auth hardening

**Depends on**: PRs #1-3 merged

**What needs to happen**:

1. **Create ApiKey entity**
   ```csharp
   public class ApiKey : AuditableEntity
   {
       public string Key { get; set; } // hashed
       public Guid TenantId { get; set; }
       public string Name { get; set; }
       public string[] Scopes { get; set; } // ["read:operations", "write:costs"]
       public DateTime? ExpiresAtUtc { get; set; }
       public DateTime? LastUsedAtUtc { get; set; }
       public bool IsRevoked { get; set; }
   }
   ```

2. **Create API key authentication middleware**
   - Extract key from header
   - Validate against DB
   - Set User + Scopes claims
   - Scope-based authorization

3. **Create CRUD endpoints**
   - POST /api/api-keys (generate)
   - GET /api/api-keys (list)
   - DELETE /api/api-keys/{id} (revoke)

4. **Create admin UI** (`frontend/src/pages/Admin/ApiKeys.tsx`)
   - Generate new key
   - List keys with last-used timestamp
   - Revoke keys

5. **Create webhook signature** validation
   - HMAC-SHA256 signing for webhooks
   - Verify on receiver side

6. **Documentation**
   - Example: curl with API key
   - Webhook contract
   - Scopes reference

7. **Tests**
   - Key auth works
   - Scope validation enforced
   - Webhook signatures verified

**DoD Checklist**:
- [ ] ApiKey entity + migration
- [ ] Key auth middleware working
- [ ] CRUD endpoints
- [ ] Admin UI for key management
- [ ] Webhook signature system
- [ ] Documentation complete
- [ ] Tests pass
- [ ] i18n keys added

---

### PR #5: Rebase + stabilization pass after Layer 1

**After PRs #1-4 merged:**

1. **Verify Foundation solid**:
   ```bash
   dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --configuration Release
   npm test -- --run (frontend)
   npx tsc --noEmit (frontend)
   ```

2. **Regression test checklist**:
   - [ ] Multi-tenant API calls correct (046)
   - [ ] Permission checks work (044)
   - [ ] Audit trail captures (045)
   - [ ] API keys authenticate (047)
   - [ ] No uncovered auth gaps

3. **Manual testing**:
   - [ ] Switch farms → data isolated
   - [ ] Non-admin cannot access other farm
   - [ ] Permission matrix enforced
   - [ ] Audit log shows changes
   - [ ] API key auth works

4. **Create "Layer 1 Complete" PR**:
   - Just documentation + checklist
   - Merge to mark milestone

---

## 🎬 How to actually start (next message)

Tell me:
1. **Ready to begin?** (yes → I start working on code)
2. **Want help reading existing code first?** (yes → I explore, find gaps)
3. **Need clarification on any PR?** (ask specifics)

Current state: Ready to have agent work on Layer 1, PRs 1-4 (Foundation).
