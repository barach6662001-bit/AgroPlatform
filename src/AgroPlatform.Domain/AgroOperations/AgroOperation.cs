using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;

namespace AgroPlatform.Domain.AgroOperations;

public class AgroOperation : AuditableEntity
{
    public Guid FieldId { get; set; }
    public AgroOperationType OperationType { get; set; }
    public DateTime PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public bool IsCompleted { get; set; }
    public string? Description { get; set; }
    public decimal? AreaProcessed { get; set; }

    public Field Field { get; set; } = null!;
    public ICollection<AgroOperationResource> Resources { get; set; } = new List<AgroOperationResource>();
    public ICollection<AgroOperationMachinery> MachineryUsed { get; set; } = new List<AgroOperationMachinery>();
}
