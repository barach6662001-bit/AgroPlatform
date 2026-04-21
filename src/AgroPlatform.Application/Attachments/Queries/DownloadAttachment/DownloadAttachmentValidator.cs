using FluentValidation;

namespace AgroPlatform.Application.Attachments.Queries.DownloadAttachment;

public class DownloadAttachmentValidator : AbstractValidator<DownloadAttachmentQuery>
{
    public DownloadAttachmentValidator()
    {
        RuleFor(x => x.AttachmentId)
            .NotEqual(Guid.Empty);
    }
}