namespace AgroPlatform.Domain.Authorization;

/// <summary>
/// Global reference entity mapping role names to the permission policy names they are granted.
/// Not tenant-scoped — applies across the entire system.
/// </summary>
public class RolePermission
{
    /// <summary>Role name (e.g., "Admin", "Manager"). Composite PK with PolicyName.</summary>
    public string RoleName { get; set; } = string.Empty;

    /// <summary>Policy name constant (e.g., "Warehouses.Manage"). Composite PK with RoleName.</summary>
    public string PolicyName { get; set; } = string.Empty;

    /// <summary>Whether this role is granted the policy. False rows allow explicit denials.</summary>
    public bool IsGranted { get; set; } = true;
}
