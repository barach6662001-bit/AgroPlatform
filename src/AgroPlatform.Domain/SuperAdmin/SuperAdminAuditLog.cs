namespace AgroPlatform.Domain.SuperAdmin;

/// <summary>
/// Append-only audit record for every super-admin mutation.
/// Not tenant-scoped — the log is platform-wide.
/// </summary>
public class SuperAdminAuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>AspNetUsers.Id of the super-admin that performed the action.</summary>
    public string AdminUserId { get; set; } = string.Empty;

    /// <summary>Symbolic action name, e.g. <c>tenant.features.update</c>.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Entity type affected (e.g. <c>Tenant</c>). Nullable for non-entity actions.</summary>
    public string? TargetType { get; set; }

    /// <summary>Primary key of the target entity, serialized as string.</summary>
    public string? TargetId { get; set; }

    /// <summary>JSON snapshot of relevant fields before the change.</summary>
    public string? Before { get; set; }

    /// <summary>JSON snapshot of relevant fields after the change.</summary>
    public string? After { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
