using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.AgroOperations.DTOs;

public class AgroOperationDto
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public AgroOperationType OperationType { get; set; }
    public OperationStatus Status { get; set; }
    public DateTime PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public bool IsCompleted => Status == OperationStatus.Completed;
    public string? Description { get; set; }
    public decimal? AreaProcessed { get; set; }
    public Guid? PerformedByEmployeeId { get; set; }
    public string? PerformedByName { get; set; }
}
