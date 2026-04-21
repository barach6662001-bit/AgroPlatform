using FluentValidation;

namespace AgroPlatform.Application.Attachments.Queries.ListAttachments;

public class ListAttachmentsValidator : AbstractValidator<ListAttachmentsQuery>
{
    public ListAttachmentsValidator()
    {
        RuleFor(x => x.EntityType)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.EntityId)
            .NotEqual(Guid.Empty);
    }
}