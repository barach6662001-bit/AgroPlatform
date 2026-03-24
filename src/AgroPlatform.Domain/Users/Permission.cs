using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Users;

/// <summary>
/// Role-based permission mapping.
/// Controls granular access to modules and operations.
/// </summary>
public class Permission : AuditableEntity
{
    /// <summary>Role that this permission applies to.</summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// Module name (e.g., "Operations", "Economics", "Machinery").
    /// Used for feature-level access control.
    /// </summary>
    public required string Module { get; set; }

    /// <summary>Permission to read/view resources in this module.</summary>
    public bool CanRead { get; set; }

    /// <summary>Permission to create new resources in this module.</summary>
    public bool CanCreate { get; set; }

    /// <summary>Permission to modify existing resources in this module.</summary>
    public bool CanUpdate { get; set; }

    /// <summary>Permission to delete resources in this module.</summary>
    public bool CanDelete { get; set; }

    /// <summary>Last time this permission was reviewed/changed.</summary>
    public DateTime? LastReviewedAtUtc { get; set; }

    /// <summary>Notes about why this permission was granted/denied.</summary>
    public string? Notes { get; set; }
}
