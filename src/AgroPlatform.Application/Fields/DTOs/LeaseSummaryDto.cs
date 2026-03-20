namespace AgroPlatform.Application.Fields.DTOs;

public class LeaseSummaryDto
{
    public Guid LandLeaseId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public decimal AnnualPayment { get; set; }
    public decimal AdvancePaid { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Remaining { get; set; }
    public string Status { get; set; } = "Unpaid";
    public List<LeasePaymentDto> Payments { get; set; } = new();
}
