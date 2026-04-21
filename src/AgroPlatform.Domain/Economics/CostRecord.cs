using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Sales;

namespace AgroPlatform.Domain.Economics;

public class CostRecord : AuditableEntity
{
    public CostCategory Category { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "UAH";
    public DateTime Date { get; set; }
    public Guid? FieldId { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// Canonical link to the Sale that originated this revenue record (negative Amount).
    /// Null for cost records or for grain-movement-originated revenue records.
    /// </summary>
    public Guid? SaleId { get; set; }

    public Field? Field { get; set; }
    public AgroOperation? AgroOperation { get; set; }
    public Sale? Sale { get; set; }
}
