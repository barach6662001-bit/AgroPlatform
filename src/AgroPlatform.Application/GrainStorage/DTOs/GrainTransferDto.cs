namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainTransferDto
{
    public Guid Id { get; set; }
    public Guid SourceBatchId { get; set; }
    public string SourceGrainType { get; set; } = string.Empty;
    public string SourceStorageName { get; set; } = string.Empty;
    public Guid TargetBatchId { get; set; }
    public string TargetGrainType { get; set; } = string.Empty;
    public string TargetStorageName { get; set; } = string.Empty;
    public decimal QuantityTons { get; set; }
    public DateTime TransferDate { get; set; }
    public string? Notes { get; set; }
}
