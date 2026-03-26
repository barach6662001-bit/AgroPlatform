using AgroPlatform.Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Registers role-permission policies that map simplified roles (Admin / Manager / Operator / Viewer)
/// and legacy roles (Administrator / Manager / Agronomist / Storekeeper / Director) to module operations.
///
/// Permission matrix:
/// ┌──────────────┬───────────────────┬───────────────────┬──────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────┬───────────────────┬───────────────────┬───────────────────┐
/// │ Role         │ Warehouses.Manage │ Inventory.Manage  │ Analytics.View│ Machinery.Manage │ Fields.Manage     │ Economics.Manage  │ HR.Manage     │ GrainStorage.Manage│ Fuel.Manage      │ Sales.Manage      │
/// ├──────────────┼───────────────────┼───────────────────┼──────────────┼───────────────────┼───────────────────┼───────────────────┼───────────────┼───────────────────┼───────────────────┼───────────────────┤
/// │ Administrator│       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │        ✓          │
/// │ Manager      │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │        ✓          │
/// │ Agronomist   │       ✗           │        ✗          │      ✓       │        ✗          │        ✓          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// │ Storekeeper  │       ✓           │        ✓          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✓          │        ✓          │        ✗          │
/// │ Director     │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✓          │       ✗       │        ✗          │        ✗          │        ✓          │
/// │ Admin        │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓          │        ✓          │        ✓          │
/// │ Operator     │       ✓           │        ✓          │      ✓       │        ✗          │        ✓          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// │ Viewer       │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✗          │        ✗          │        ✗          │
/// └──────────────┴───────────────────┴───────────────────┴──────────────┴───────────────────┴───────────────────┴───────────────────┴───────────────┴───────────────────┴───────────────────┴───────────────────┘
/// </summary>
public static class PermissionPolicies
{
    // Roles allowed to manage (create / update / delete) warehouses and stock items
    private static readonly string[] WarehouseManagers =
        ["Administrator", "Manager", "Storekeeper", "Admin", "Operator"];

    // Roles allowed to manage (create / update / delete) inventory movements and adjustments
    private static readonly string[] InventoryManagers =
        ["Administrator", "Manager", "Storekeeper", "Admin", "Operator"];

    // All authenticated roles can view analytics
    private static readonly string[] AnalyticsViewers =
        ["Administrator", "Manager", "Agronomist", "Storekeeper", "Director", "Admin", "Operator", "Viewer"];

    // Roles allowed to manage (create / update / delete) machinery records
    private static readonly string[] MachineryManagers =
        ["Administrator", "Manager", "Admin"];

    // Roles allowed to manage (create / update / delete) field records
    private static readonly string[] FieldManagers =
        ["Administrator", "Manager", "Agronomist", "Admin", "Operator"];

    // Roles allowed to manage economics (cost records, budgets)
    private static readonly string[] EconomicsManagers =
        ["Administrator", "Manager", "Director", "Admin"];

    // Roles allowed to manage HR (employees, work logs, salary payments)
    private static readonly string[] HRManagers =
        ["Administrator", "Manager", "Admin"];

    // Roles allowed to manage grain storage (batches, movements, grain types)
    private static readonly string[] GrainStorageManagers =
        ["Administrator", "Manager", "Storekeeper", "Admin"];

    // Roles allowed to manage fuel supply and issue transactions (tank creation uses Machinery.Manage)
    private static readonly string[] FuelManagers =
        ["Administrator", "Manager", "Storekeeper", "Admin"];

    // Roles allowed to manage sales
    private static readonly string[] SalesManagers =
        ["Administrator", "Manager", "Director", "Admin"];

    // Administrator-only: system management (users, permissions, audit, tenant config)
    private static readonly string[] AdminOnly =
        ["Administrator"];

    public static IServiceCollection AddPermissionPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(Permissions.Warehouses.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Warehouses.Manage,
                policy => policy.RequireRole(WarehouseManagers));

            options.AddPolicy(Permissions.Inventory.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Inventory.Manage,
                policy => policy.RequireRole(InventoryManagers));

            options.AddPolicy(Permissions.Analytics.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Machinery.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Machinery.Manage,
                policy => policy.RequireRole(MachineryManagers));

            options.AddPolicy(Permissions.Fields.View,
                policy => policy.RequireAuthenticatedUser());

            options.AddPolicy(Permissions.Fields.Manage,
                policy => policy.RequireRole(FieldManagers));

            options.AddPolicy(Permissions.Economics.Manage,
                policy => policy.RequireRole(EconomicsManagers));

            options.AddPolicy(Permissions.HR.Manage,
                policy => policy.RequireRole(HRManagers));

            options.AddPolicy(Permissions.GrainStorage.Manage,
                policy => policy.RequireRole(GrainStorageManagers));

            options.AddPolicy(Permissions.Fuel.Manage,
                policy => policy.RequireRole(FuelManagers));

            options.AddPolicy(Permissions.Sales.Manage,
                policy => policy.RequireRole(SalesManagers));

            options.AddPolicy(Permissions.Admin.Manage,
                policy => policy.RequireRole(AdminOnly));
        });

        return services;
    }
}
