using AgroPlatform.Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Registers authorization policies backed by the DB-driven RBAC system.
///
/// Authorization flow per manage policy:
///   1. Admin override  — roles normalizing to "Admin" (including legacy "Administrator") succeed
///      immediately without any DB hit (see <see cref="PermissionAuthorizationHandler"/>).
///   2. DB permission   — the <c>RolePermissions</c> table is queried; results cached 5 minutes.
///   3. Hardcoded fallback — when DB has no rows for the role, the compile-time matrix in
///      <see cref="HardcodedPermissionFallback"/> is used.
///
/// Permission matrix (for reference):
/// ┌──────────────┬───────────────────┬───────────────────┬──────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────┬───────────────────┬───────────────────┬───────────────────┐
/// │ Role         │ Warehouses.Manage │ Inventory.Manage  │ Analytics.View│ Machinery.Manage │ Fields.Manage     │ Economics.Manage  │ HR.Manage     │ GrainStorage.Manage│ Fuel.Manage      │ Sales.Manage      │
/// ├──────────────┼───────────────────┼───────────────────┼──────────────┼───────────────────┼───────────────────┼───────────────────┼───────────────┼───────────────────┼───────────────────┼───────────────────┤
/// │ Admin        │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │        ✓          │
/// │ Administrator│  (→ Admin via normalization)                                                                                                                                                                    │
/// │ Manager      │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │        ✓          │
/// │ Agronomist   │       ✗           │        ✗          │      ✓       │        ✗          │        ✓          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// │ Storekeeper  │       ✓           │        ✓          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✓          │        ✓          │        ✗          │
/// │ Director     │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✓          │       ✗       │        ✗          │        ✗          │        ✓          │
/// │ Operator     │       ✓           │        ✓          │      ✓       │        ✗          │        ✓          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// │ Viewer       │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// └──────────────┴───────────────────┴───────────────────┴──────────────┴───────────────────┴───────────────────┴───────────────────┴───────────────┴───────────────────┴───────────────────┴───────────────────┘
/// </summary>
public static class PermissionPolicies
{
    public static IServiceCollection AddPermissionPolicies(this IServiceCollection services)
    {
        // IMemoryCache is required by PermissionAuthorizationHandler
        services.AddMemoryCache();

        // Register DB-driven permission handler as singleton (safe: uses IServiceScopeFactory + IMemoryCache)
        services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            // ── View policies ─────────────────────────────────────────────────────────────
            // All authenticated users can view these modules regardless of role.

            options.AddPolicy(Permissions.Warehouses.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Inventory.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Analytics.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Machinery.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Fields.View,
                policy => policy.RequireAuthenticatedUser());

            // ── Manage policies ───────────────────────────────────────────────────────────
            // Evaluated by PermissionAuthorizationHandler (Admin override → DB → fallback).

            options.AddPolicy(Permissions.Warehouses.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Warehouses.Manage)));

            options.AddPolicy(Permissions.Inventory.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Inventory.Manage)));

            options.AddPolicy(Permissions.Machinery.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Machinery.Manage)));

            options.AddPolicy(Permissions.Fields.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Fields.Manage)));

            options.AddPolicy(Permissions.Economics.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Economics.Manage)));

            options.AddPolicy(Permissions.HR.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.HR.Manage)));

            options.AddPolicy(Permissions.GrainStorage.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.GrainStorage.Manage)));

            options.AddPolicy(Permissions.Fuel.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Fuel.Manage)));

            options.AddPolicy(Permissions.Sales.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Sales.Manage)));

            options.AddPolicy(Permissions.Admin.Manage,
                policy => policy.AddRequirements(new PermissionRequirement(Permissions.Admin.Manage)));
        });

        return services;
    }
}
