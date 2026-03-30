using AgroPlatform.Application.Attachments.Common;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Attachments.Queries.ListAttachments;

public class ListAttachmentsHandler : IRequestHandler<ListAttachmentsQuery, IReadOnlyList<AttachmentDto>>
{
    private readonly IAppDbContext _context;

    public ListAttachmentsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AttachmentDto>> Handle(ListAttachmentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Attachments
            .Where(a => a.EntityType == request.EntityType && a.EntityId == request.EntityId)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new AttachmentDto
            {
                Id = a.Id,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                FileName = a.FileName,
                ContentType = a.ContentType,
                SizeBytes = a.SizeBytes,
                Description = a.Description,
                CreatedAtUtc = a.CreatedAtUtc,
                CreatedBy = a.CreatedBy,
            })
            .ToListAsync(cancellationToken);
    }
}