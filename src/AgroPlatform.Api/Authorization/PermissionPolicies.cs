using AgroPlatform.Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Registers role-permission policies that map simplified roles (Admin / Manager / Operator / Viewer)
/// and legacy roles (Administrator / Manager / Agronomist / Storekeeper / Director) to module operations.
///
/// Permission matrix:
/// ┌──────────────┬───────────────────┬───────────────────┬──────────────┬───────────────────┬───────────────────┐
/// │ Role         │ Warehouses.Manage │ Inventory.Manage  │ Analytics.View│ Machinery.Manage │ Fields.Manage     │
/// ├──────────────┼───────────────────┼───────────────────┼──────────────┼───────────────────┼───────────────────┤
/// │ Admin        │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │
/// │ Manager      │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │
/// │ Operator     │       ✓           │        ✓          │      ✓       │        ✗          │        ✓          │
/// │ Viewer       │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │
/// ├──────────────┼───────────────────┼───────────────────┼──────────────┼───────────────────┼───────────────────┤
/// │ Administrator│       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │
/// │ Agronomist   │       ✗           │        ✗          │      ✓       │        ✗          │        ✓          │
/// │ Storekeeper  │       ✓           │        ✓          │      ✓       │        ✗          │        ✗          │
/// │ Director     │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │
/// └──────────────┴───────────────────┴───────────────────┴──────────────┴───────────────────┴───────────────────┘
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
        });

        return services;
    }
}
