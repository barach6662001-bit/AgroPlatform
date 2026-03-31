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

    public static class Economics
    {
        public const string Manage = "Economics.Manage";
    }

    public static class HR
    {
        public const string Manage = "HR.Manage";
    }

    public static class GrainStorage
    {
        public const string Manage = "GrainStorage.Manage";
    }

    public static class Fuel
    {
        public const string Manage = "Fuel.Manage";
    }

    public static class Sales
    {
        public const string Manage = "Sales.Manage";
    }

    public static class Admin
    {
        public const string Manage = "Admin.Manage";
    }

    public static class Platform
    {
        public const string SuperAdmin = "Platform.SuperAdmin";
    }
}
