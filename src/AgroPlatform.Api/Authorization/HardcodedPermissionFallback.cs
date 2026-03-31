using AgroPlatform.Domain.Authorization;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// In-memory fallback that mirrors the original hardcoded role-permission matrix.
/// Used by <see cref="PermissionAuthorizationHandler"/> when the <see cref="RolePermission"/>
/// table has no rows for a given role (e.g., on a fresh DB before seeding).
/// </summary>
internal static class HardcodedPermissionFallback
{
    private static readonly Dictionary<string, HashSet<string>> _matrix = new(StringComparer.Ordinal)
    {
        // Admin = full access (Administrator normalizes to Admin in the handler)
        ["Admin"] =
        [
            "Warehouses.Manage", "Inventory.Manage", "Machinery.Manage", "Fields.Manage",
            "Economics.Manage",  "HR.Manage",         "GrainStorage.Manage", "Fuel.Manage",
            "Sales.Manage",      "Admin.Manage"
        ],
        // Manager = all except Admin.Manage
        ["Manager"] =
        [
            "Warehouses.Manage", "Inventory.Manage", "Machinery.Manage", "Fields.Manage",
            "Economics.Manage",  "HR.Manage",         "GrainStorage.Manage", "Fuel.Manage",
            "Sales.Manage"
        ],
        ["Agronomist"]  = ["Fields.Manage"],
        ["Storekeeper"] = ["Warehouses.Manage", "Inventory.Manage", "GrainStorage.Manage", "Fuel.Manage"],
        ["Director"]    = ["Economics.Manage", "Sales.Manage"],
        ["Operator"]    = ["Warehouses.Manage", "Inventory.Manage", "Fields.Manage"],
        ["Viewer"]      = [],
    };

    /// <summary>
    /// Returns the set of policy names granted to <paramref name="normalizedRole"/>.
    /// Always returns a non-null set (empty set for unknown or unprivileged roles).
    /// </summary>
    public static HashSet<string> GetGrantedPolicies(string normalizedRole) =>
        _matrix.TryGetValue(normalizedRole, out var set) ? set : [];
}
