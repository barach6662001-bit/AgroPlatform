using AgroPlatform.Application.Attachments.Common;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Attachments.Queries.DownloadAttachment;

public class DownloadAttachmentHandler : IRequestHandler<DownloadAttachmentQuery, AttachmentDownloadDto>
{
    private readonly IAppDbContext _context;
    private readonly IAttachmentStorage _attachmentStorage;

    public DownloadAttachmentHandler(IAppDbContext context, IAttachmentStorage attachmentStorage)
    {
        _context = context;
        _attachmentStorage = attachmentStorage;
    }

    public async Task<AttachmentDownloadDto> Handle(DownloadAttachmentQuery request, CancellationToken cancellationToken)
    {
        var attachment = await _context.Attachments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.AttachmentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Common.Attachment), request.AttachmentId);

        var content = await _attachmentStorage.ReadAsync(attachment.StoragePath, cancellationToken);

        return new AttachmentDownloadDto
        {
            FileName = attachment.FileName,
            ContentType = attachment.ContentType,
            Content = content,
        };
    }
}