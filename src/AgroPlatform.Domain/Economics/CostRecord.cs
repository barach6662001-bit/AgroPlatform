using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Fields;

namespace AgroPlatform.Domain.Economics;

public class CostRecord : AuditableEntity
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "UAH";
    public DateTime Date { get; set; }
    public Guid? FieldId { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Description { get; set; }

    public Field? Field { get; set; }
    public AgroOperation? AgroOperation { get; set; }
}
