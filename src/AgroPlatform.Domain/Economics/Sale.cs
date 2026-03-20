using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;

namespace AgroPlatform.Domain.Economics;

public class Sale : AuditableEntity
{
    public string BuyerName { get; set; } = string.Empty;
    public string? ContractNumber { get; set; }
    public CropType CropType { get; set; }
    public decimal QuantityTons { get; set; }
    public decimal PricePerTon { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public Guid? GrainBatchId { get; set; }

    public GrainBatch? GrainBatch { get; set; }
}
