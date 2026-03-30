namespace AgroPlatform.Application.Attachments.Common;

public class AttachmentDto
{
    public Guid Id { get; init; }
    public string EntityType { get; init; } = string.Empty;
    public Guid EntityId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public string? Description { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string? CreatedBy { get; init; }
}