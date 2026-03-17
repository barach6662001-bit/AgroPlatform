namespace AgroPlatform.Application.Fields.DTOs;

public class LeasePaymentDto
{
    public Guid Id { get; set; }
    public Guid LandLeaseId { get; set; }
    public int Year { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Payment";
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
}
