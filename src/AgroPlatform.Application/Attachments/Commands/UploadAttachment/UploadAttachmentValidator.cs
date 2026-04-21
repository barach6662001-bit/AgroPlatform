using FluentValidation;

namespace AgroPlatform.Application.Attachments.Commands.UploadAttachment;

public class UploadAttachmentValidator : AbstractValidator<UploadAttachmentCommand>
{
    private const int MaxFileNameLength = 260;
    private const int MaxDescriptionLength = 1000;

    public UploadAttachmentValidator()
    {
        RuleFor(x => x.EntityType)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.EntityId)
            .NotEqual(Guid.Empty);

        RuleFor(x => x.FileName)
            .NotEmpty()
            .MaximumLength(MaxFileNameLength);

        RuleFor(x => x.Content)
            .NotNull()
            .Must(content => content.Length > 0)
            .WithMessage("Attachment content cannot be empty.");

        RuleFor(x => x.Description)
            .MaximumLength(MaxDescriptionLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}