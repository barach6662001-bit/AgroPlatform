using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.GrainStorage;

namespace AgroPlatform.Domain.Sales;

public class Sale : AuditableEntity
{
    public DateTime Date { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string Product { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "т";
    public decimal PricePerUnit { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "UAH";
    public Guid? FieldId { get; set; }
    public string? Notes { get; set; }

    /// <summary>
    /// Optional canonical link to the GrainMovement (dispatch) that corresponds to this sale.
    /// Set when the sale was recorded alongside a grain dispatch from storage.
    /// </summary>
    public Guid? GrainMovementId { get; set; }

    public Field? Field { get; set; }
    public GrainMovement? GrainMovement { get; set; }
}
