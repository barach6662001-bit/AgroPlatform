using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Fuel;

public class FuelTransaction : AuditableEntity
{
    public Guid FuelTankId { get; set; }
    public FuelTank FuelTank { get; set; } = null!;
    public string TransactionType { get; set; } = string.Empty;
    public decimal QuantityLiters { get; set; }
    public decimal? PricePerLiter { get; set; }
    public decimal? TotalCost { get; set; }
    public DateTime TransactionDate { get; set; }
    public Guid? MachineId { get; set; }
    public string? DriverName { get; set; }
    public string? SupplierName { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Notes { get; set; }
}
