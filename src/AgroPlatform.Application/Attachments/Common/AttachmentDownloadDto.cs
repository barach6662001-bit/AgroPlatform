namespace AgroPlatform.Application.Attachments.Common;

public class AttachmentDownloadDto
{
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required byte[] Content { get; init; }
}