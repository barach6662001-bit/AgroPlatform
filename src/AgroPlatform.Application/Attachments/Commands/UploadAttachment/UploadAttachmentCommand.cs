using AgroPlatform.Application.Attachments.Common;
using MediatR;

namespace AgroPlatform.Application.Attachments.Commands.UploadAttachment;

public record UploadAttachmentCommand(
    string EntityType,
    Guid EntityId,
    string FileName,
    string ContentType,
    byte[] Content,
    string? Description) : IRequest<AttachmentDto>;