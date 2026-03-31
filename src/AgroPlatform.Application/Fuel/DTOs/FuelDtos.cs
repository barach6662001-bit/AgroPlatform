namespace AgroPlatform.Application.Fuel.DTOs;

public class FuelNormDto
{
    public Guid Id { get; set; }
    public string MachineType { get; set; } = string.Empty;
    public string OperationType { get; set; } = string.Empty;
    public decimal? NormLitersPerHa { get; set; }
    public decimal? NormLitersPerHour { get; set; }
    public string? Notes { get; set; }
}

public class FuelConsumptionComparisonDto
{
    public Guid? MachineId { get; set; }
    public string? MachineName { get; set; }
    public string MachineType { get; set; } = string.Empty;
    public string OperationType { get; set; } = string.Empty;
    public decimal ActualLiters { get; set; }
    public decimal? AreaHa { get; set; }
    public decimal? NormLitersPerHa { get; set; }
    public decimal? ExpectedLiters { get; set; }
    public decimal? DeviationLiters { get; set; }
    /// <summary>Positive = over-consumption, negative = under-consumption.</summary>
    public decimal? DeviationPercent { get; set; }
}

public class FuelTankDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int FuelType { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLiters { get; set; }
    public decimal? PricePerLiter { get; set; }
    public bool IsActive { get; set; }
    public decimal FillPercentage { get; set; }
}

public class FuelTransactionDto
{
    public Guid Id { get; set; }
    public Guid FuelTankId { get; set; }
    public string TankName { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public decimal QuantityLiters { get; set; }
    public decimal? PricePerLiter { get; set; }
    public decimal? TotalCost { get; set; }
    public DateTime TransactionDate { get; set; }
    public Guid? MachineId { get; set; }
    public Guid? FieldId { get; set; }
    public string? FieldName { get; set; }
    public string? DriverName { get; set; }
    public string? SupplierName { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Notes { get; set; }
}
