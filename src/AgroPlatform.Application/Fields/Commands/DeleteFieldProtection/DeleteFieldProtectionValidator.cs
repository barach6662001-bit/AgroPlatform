using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldProtection;

public class DeleteFieldProtectionValidator : AbstractValidator<DeleteFieldProtectionCommand>
{
    public DeleteFieldProtectionValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
