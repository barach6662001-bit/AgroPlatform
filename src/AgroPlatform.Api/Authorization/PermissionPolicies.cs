using AgroPlatform.Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Registers role-permission policies.
///
/// New role matrix (Phase 0 refactoring):
/// ┌──────────────────┬───────────────────┬───────────────────┬──────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────┬─────────────────────┬───────────────────┬───────────────────┐
/// │ Role             │ Warehouses.Manage │ Inventory.Manage  │ Analytics.View│ Machinery.Manage │ Fields.Manage     │ Economics.Manage  │ HR.Manage     │ GrainStorage.Manage │ Fuel.Manage       │ Sales.Manage      │
/// ├──────────────────┼───────────────────┼───────────────────┼──────────────┼───────────────────┼───────────────────┼───────────────────┼───────────────┼─────────────────────┼───────────────────┼───────────────────┤
/// │ SuperAdmin       │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓            │        ✓          │        ✓          │
/// │ CompanyAdmin     │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓            │        ✓          │        ✓          │
/// │ Manager          │       ✓           │        ✓          │      ✓       │        ✓          │        ✓          │        ✓          │       ✓       │        ✓            │        ✓          │        ✓          │
/// │ WarehouseOperator│       ✓           │        ✓          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✓            │        ✓          │        ✗          │
/// │ Accountant       │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✓          │       ✓       │        ✗            │        ✗          │        ✓          │
/// │ Viewer           │       ✗           │        ✗          │      ✓       │        ✗          │        ✗          │        ✗          │       ✗       │        ✗            │        ✗          │        ✗          │
/// └──────────────────┴───────────────────┴───────────────────┴──────────────┴───────────────────┴───────────────────┴───────────────────┴───────────────┴─────────────────────┴───────────────────┴───────────────────┘
/// </summary>
public static class PermissionPolicies
{
    private static readonly string[] AllManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager",
         // Legacy role names kept for backward compatibility
         "Administrator", "Admin"];

    private static readonly string[] WarehouseManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator",
         "Administrator", "Admin", "Storekeeper", "Operator"];

    private static readonly string[] InventoryManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator",
         "Administrator", "Admin", "Storekeeper", "Operator"];

    private static readonly string[] MachineryManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager",
         "Administrator", "Admin"];

    private static readonly string[] FieldManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager",
         "Administrator", "Admin", "Agronomist", "Operator"];

    private static readonly string[] EconomicsManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "Accountant",
         "Administrator", "Admin", "Director"];

    private static readonly string[] HRManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "Accountant",
         "Administrator", "Admin"];

    private static readonly string[] GrainStorageManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator",
         "Administrator", "Admin", "Storekeeper"];

    private static readonly string[] FuelManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator",
         "Administrator", "Admin", "Storekeeper"];

    private static readonly string[] SalesManagers =
        ["SuperAdmin", "CompanyAdmin", "Manager", "Accountant",
         "Administrator", "Admin", "Director"];

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
                policy => policy.RequireRole(AllManagers));

            // Platform-level policy — only SuperAdmin role is granted this
            options.AddPolicy(Permissions.Platform.SuperAdmin,
                policy => policy.RequireRole("SuperAdmin"));
        });

        return services;
    }
}
