namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainStorageOverviewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Location { get; set; }
    public string? StorageType { get; set; }
    public decimal? CapacityTons { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }

    /// <summary>Total tons currently stored across all active batches.</summary>
    public decimal OccupiedTons { get; set; }

    /// <summary>Free capacity in tons. Null if capacity is not set.</summary>
    public decimal? FreeTons { get; set; }

    /// <summary>Occupancy as a percentage (0-100). Null if capacity is not set.</summary>
    public decimal? OccupancyPercent { get; set; }

    /// <summary>Number of active (non-zero) batches in this storage.</summary>
    public int BatchCount { get; set; }

    /// <summary>Distinct grain types currently stored.</summary>
    public IReadOnlyList<string> GrainTypes { get; set; } = [];

    /// <summary>Summary of active batches in this storage.</summary>
    public IReadOnlyList<GrainBatchSummaryDto> Batches { get; set; } = [];

    /// <summary>Warning messages for mixed crops or abnormal states.</summary>
    public IReadOnlyList<string> Warnings { get; set; } = [];
}
