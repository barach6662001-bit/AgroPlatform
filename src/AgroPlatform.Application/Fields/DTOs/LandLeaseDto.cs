namespace AgroPlatform.Application.Fields.DTOs;

public class LandLeaseDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }
    public string? ContractNumber { get; set; }
    public decimal AnnualPayment { get; set; }
    public string PaymentType { get; set; } = "Cash";
    public decimal? GrainPaymentTons { get; set; }
    public bool IsActive { get; set; }
    public DateTime ContractStartDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public string? Notes { get; set; }
}
