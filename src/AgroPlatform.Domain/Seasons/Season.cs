using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Seasons;

/// <summary>
/// Tenant-scoped agricultural season with explicit start/end boundaries.
/// Replaces the legacy year-list model (derived from transaction timestamps).
/// </summary>
public class Season : AuditableEntity
{
    /// <summary>Short machine-friendly code, e.g. "2025/2026" or "2026". Unique per tenant.</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Human-facing name, e.g. "Сезон 2025/2026".</summary>
    public string Name { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    /// <summary>True for the single season currently active for the tenant.</summary>
    public bool IsCurrent { get; set; }
}
