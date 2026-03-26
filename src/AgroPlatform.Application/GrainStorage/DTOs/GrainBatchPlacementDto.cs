namespace AgroPlatform.Application.GrainStorage.DTOs;

public class GrainBatchPlacementDto
{
    public Guid Id { get; set; }
    public Guid GrainStorageId { get; set; }
    public string GrainStorageName { get; set; } = string.Empty;
    public Guid? GrainStorageUnitId { get; set; }
    public decimal QuantityTons { get; set; }
}
