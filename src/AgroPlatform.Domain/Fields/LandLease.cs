using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fields;

public class LandLease : AuditableEntity
{
    public Guid FieldId { get; set; }
    public Field Field { get; set; } = null!;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }
    public string? ContractNumber { get; set; }
    public decimal AnnualPayment { get; set; }
    public string PaymentType { get; set; } = "Cash";
    public decimal? GrainPaymentTons { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime ContractStartDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public string? Notes { get; set; }

    public ICollection<LeasePayment> Payments { get; set; } = new List<LeasePayment>();
}
