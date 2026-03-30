using AgroPlatform.Application.Attachments.Common;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Common;
using MediatR;

namespace AgroPlatform.Application.Attachments.Commands.UploadAttachment;

public class UploadAttachmentHandler : IRequestHandler<UploadAttachmentCommand, AttachmentDto>
{
    private readonly IAppDbContext _context;
    private readonly IAttachmentStorage _attachmentStorage;
    private readonly ICurrentUserService _currentUserService;

    public UploadAttachmentHandler(
        IAppDbContext context,
        IAttachmentStorage attachmentStorage,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _attachmentStorage = attachmentStorage;
        _currentUserService = currentUserService;
    }

    public async Task<AttachmentDto> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        var attachmentId = Guid.NewGuid();
        var tenantId = _currentUserService.TenantId;
        var createdAtUtc = DateTime.UtcNow;
        var normalizedFileName = Path.GetFileName(request.FileName);

        await using var stream = new MemoryStream(request.Content, writable: false);
        var storagePath = await _attachmentStorage.SaveAsync(
            tenantId,
            request.EntityType,
            request.EntityId,
            attachmentId,
            normalizedFileName,
            stream,
            cancellationToken);

        var attachment = new Attachment
        {
            Id = attachmentId,
            TenantId = tenantId,
            EntityType = request.EntityType.Trim(),
            EntityId = request.EntityId,
            FileName = normalizedFileName,
            ContentType = string.IsNullOrWhiteSpace(request.ContentType)
                ? "application/octet-stream"
                : request.ContentType,
            StoragePath = storagePath,
            SizeBytes = request.Content.LongLength,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            CreatedAtUtc = createdAtUtc,
            CreatedBy = _currentUserService.UserId,
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        return new AttachmentDto
        {
            Id = attachment.Id,
            EntityType = attachment.EntityType,
            EntityId = attachment.EntityId,
            FileName = attachment.FileName,
            ContentType = attachment.ContentType,
            SizeBytes = attachment.SizeBytes,
            Description = attachment.Description,
            CreatedAtUtc = attachment.CreatedAtUtc,
            CreatedBy = attachment.CreatedBy,
        };
    }
}