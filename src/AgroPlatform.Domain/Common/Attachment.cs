namespace AgroPlatform.Domain.Common;

public class Attachment : AuditableEntity
{
    public required string EntityType { get; set; }
    public Guid EntityId { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required string StoragePath { get; set; }
    public long SizeBytes { get; set; }
    public string? Description { get; set; }
}