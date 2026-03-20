using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Economics.DTOs;

public class SaleDto
{
    public Guid Id { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string? ContractNumber { get; set; }
    public CropType CropType { get; set; }
    public decimal QuantityTons { get; set; }
    public decimal PricePerTon { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public Guid? GrainBatchId { get; set; }
}
