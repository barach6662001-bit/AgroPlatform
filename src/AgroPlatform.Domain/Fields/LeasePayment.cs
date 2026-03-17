using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class LeasePayment : AuditableEntity
{
    public Guid LandLeaseId { get; set; }
    public LandLease LandLease { get; set; } = null!;
    public int Year { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Payment";
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
}
