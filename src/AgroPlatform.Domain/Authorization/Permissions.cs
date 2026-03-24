namespace AgroPlatform.Domain.Authorization;

/// <summary>
/// Defines permission policy names for each module.
/// Use these constants as the policy name in <c>[Authorize(Policy = ...)]</c>.
/// </summary>
public static class Permissions
{
    public static class Warehouses
    {
        public const string View   = "Warehouses.View";
        public const string Manage = "Warehouses.Manage";
    }

    public static class Inventory
    {
        public const string View   = "Inventory.View";
        public const string Manage = "Inventory.Manage";
    }

    public static class Analytics
    {
        public const string View = "Analytics.View";
    }

    public static class Machinery
    {
        public const string View   = "Machinery.View";
        public const string Manage = "Machinery.Manage";
    }

    public static class Fields
    {
        public const string View   = "Fields.View";
        public const string Manage = "Fields.Manage";
    }
}
