using AgroPlatform.Application.Attachments.Common;
using MediatR;

namespace AgroPlatform.Application.Attachments.Queries.DownloadAttachment;

public record DownloadAttachmentQuery(Guid AttachmentId) : IRequest<AttachmentDownloadDto>;