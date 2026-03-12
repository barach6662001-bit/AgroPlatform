using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Economics;

public class Budget : AuditableEntity
{
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal PlannedAmount { get; set; }
    public string? Note { get; set; }
}
