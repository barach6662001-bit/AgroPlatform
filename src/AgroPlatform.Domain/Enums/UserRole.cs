namespace AgroPlatform.Domain.Enums;

public enum UserRole
{
    SuperAdmin          = 0,  // Platform-level, TenantId = Guid.Empty
    CompanyAdmin        = 1,  // Company administrator
    Manager             = 2,  // Company-level
    WarehouseOperator   = 3,  // Company-level (replaces Storekeeper/Operator)
    Accountant          = 4,  // Company-level (replaces Director)
    Viewer              = 5,  // Company-level, read-only
}
