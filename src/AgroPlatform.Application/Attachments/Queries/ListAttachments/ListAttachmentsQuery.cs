using AgroPlatform.Application.Attachments.Common;
using MediatR;

namespace AgroPlatform.Application.Attachments.Queries.ListAttachments;

public record ListAttachmentsQuery(string EntityType, Guid EntityId) : IRequest<IReadOnlyList<AttachmentDto>>;