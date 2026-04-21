namespace AgroPlatform.Application.Common.Interfaces;

public interface IAttachmentStorage
{
    Task<string> SaveAsync(
        Guid tenantId,
        string entityType,
        Guid entityId,
        Guid attachmentId,
        string fileName,
        Stream content,
        CancellationToken cancellationToken = default);

    Task<byte[]> ReadAsync(string storagePath, CancellationToken cancellationToken = default);
}