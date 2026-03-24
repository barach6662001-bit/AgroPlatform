namespace AgroPlatform.Domain.Common;

/// <summary>
/// Audit trail entry. Records all changes to entities for compliance and forensics.
/// </summary>
public class AuditEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Entity type being audited (e.g., "Operation", "Field", "CostRecord").
    /// </summary>
    public required string EntityType { get; set; }

    /// <summary>
    /// ID of the entity being changed.
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// Action performed: Created, Updated, Deleted.
    /// </summary>
    public required string Action { get; set; }

    /// <summary>
    /// JSON representation of old values (for updates/deletes).
    /// Format: { "field1": "oldValue1", "field2": "oldValue2" }
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// JSON representation of new values (for creates/updates).
    /// Format: { "field1": "newValue1", "field2": "newValue2" }
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    /// Optional IP address of requester.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Optional notes/description of the change.
    /// </summary>
    public string? Notes { get; set; }
}
