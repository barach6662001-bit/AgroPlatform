using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Fuel;

public class FuelTank : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public FuelType FuelType { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLiters { get; set; }
    public decimal? PricePerLiter { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<FuelTransaction> Transactions { get; set; } = new List<FuelTransaction>();
}
