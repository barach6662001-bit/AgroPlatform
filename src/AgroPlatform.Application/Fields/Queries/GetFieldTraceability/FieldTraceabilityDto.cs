namespace AgroPlatform.Application.Fields.Queries.GetFieldTraceability;

public class FieldTraceabilityDto
{
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }

    /// <summary>Warehouse stock issues linked to this field (inputs: seeds, fertilizers, pesticides, fuel).</summary>
    public List<TraceWarehouseIssueDto> WarehouseIssues { get; set; } = new();

    /// <summary>Agro operations performed on this field.</summary>
    public List<TraceAgroOperationDto> AgroOperations { get; set; } = new();

    /// <summary>Harvest records for this field.</summary>
    public List<TraceHarvestDto> Harvests { get; set; } = new();

    /// <summary>Grain batches sourced from this field.</summary>
    public List<TraceGrainBatchDto> GrainBatches { get; set; } = new();

    /// <summary>Sales linked to this field.</summary>
    public List<TraceSaleDto> Sales { get; set; } = new();
}

public class TraceWarehouseIssueDto
{
    public Guid LedgerId { get; set; }
    public DateTime IssuedAt { get; set; }
    public string? ItemName { get; set; }
    public decimal Quantity { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public decimal? TotalCost { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Note { get; set; }
}

public class TraceAgroOperationDto
{
    public Guid Id { get; set; }
    public string OperationType { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? AreaProcessed { get; set; }
}

public class TraceHarvestDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public decimal? YieldTonsPerHa { get; set; }
    public decimal? TotalYieldTons { get; set; }
    public string? CropType { get; set; }
}

public class TraceGrainBatchDto
{
    public Guid Id { get; set; }
    public string GrainType { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public decimal InitialQuantityTons { get; set; }
    public DateTime ReceivedDate { get; set; }
    public decimal? PricePerTon { get; set; }
}

public class TraceSaleDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string Product { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
}
