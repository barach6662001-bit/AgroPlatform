using AgroPlatform.Domain.Authorization;

namespace AgroPlatform.Api.Authorization;

internal static class HardcodedPermissionFallback
{
    private static readonly string[] AllViews =
    [
        "Warehouses.View", "Inventory.View", "Analytics.View", "Machinery.View", "Fields.View",
        "Economics.View", "HR.View", "GrainStorage.View", "Fuel.View", "Sales.View"
    ];

    private static readonly Dictionary<string, HashSet<string>> _matrix = new(StringComparer.Ordinal)
    {
        ["CompanyAdmin"] = [..AllViews,
            "Warehouses.Manage", "Inventory.Manage", "Machinery.Manage", "Fields.Manage",
            "Economics.Manage",  "HR.Manage",         "GrainStorage.Manage", "Fuel.Manage",
            "Sales.Manage",      "Admin.Manage"
        ],
        ["Manager"] = [..AllViews,
            "Warehouses.Manage", "Inventory.Manage", "Machinery.Manage", "Fields.Manage",
            "Economics.Manage",  "HR.Manage",         "GrainStorage.Manage", "Fuel.Manage",
            "Sales.Manage"
        ],
        ["WarehouseOperator"] = [..AllViews, "Warehouses.Manage", "Inventory.Manage", "GrainStorage.Manage", "Fuel.Manage"],
        ["Accountant"]        = [..AllViews, "Economics.Manage", "HR.Manage", "Sales.Manage"],
        ["Viewer"]            = [..AllViews],
    };

    public static HashSet<string> GetGrantedPolicies(string normalizedRole) =>
        _matrix.TryGetValue(normalizedRole, out var set) ? set : [];
}
