using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Fuel;

/// <summary>Expected fuel consumption norm for a machine-type × operation-type combination.</summary>
public class FuelNorm : AuditableEntity
{
    public MachineryType MachineType { get; set; }
    public AgroOperationType OperationType { get; set; }

    /// <summary>Expected litres per hectare. Null if norm is expressed per hour.</summary>
    public decimal? NormLitersPerHa { get; set; }

    /// <summary>Expected litres per hour. Null if norm is expressed per hectare.</summary>
    public decimal? NormLitersPerHour { get; set; }

    public string? Notes { get; set; }
}
