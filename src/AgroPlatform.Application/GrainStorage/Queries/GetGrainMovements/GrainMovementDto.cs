namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public class GrainMovementDto
{
    public Guid Id { get; init; }
    public Guid GrainBatchId { get; init; }
    public string MovementType { get; init; } = string.Empty;
    public decimal QuantityTons { get; init; }
    public DateTime MovementDate { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
}
