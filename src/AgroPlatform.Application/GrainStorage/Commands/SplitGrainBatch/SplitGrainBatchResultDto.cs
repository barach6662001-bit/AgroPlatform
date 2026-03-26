namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public class SplitGrainBatchResultDto
{
    public Guid SourceBatchId { get; set; }
    public decimal RemainingQuantityTons { get; set; }
    public List<SplitResultItem> CreatedBatches { get; set; } = new();
}

public class SplitResultItem
{
    public Guid NewBatchId { get; set; }
    public Guid TargetStorageId { get; set; }
    public string TargetStorageName { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
}
