using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.GrainStorage;

namespace AgroPlatform.Domain.Fields;

public class LeasePayment : AuditableEntity
{
    public Guid LandLeaseId { get; set; }
    public LandLease LandLease { get; set; } = null!;
    public int Year { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Payment";
    public string PaymentMethod { get; set; } = "Cash";
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }

    // Grain payment fields
    public Guid? GrainBatchId { get; set; }
    public GrainBatch? GrainBatch { get; set; }
    public decimal? GrainQuantityTons { get; set; }
    public decimal? GrainPricePerTon { get; set; }
}
