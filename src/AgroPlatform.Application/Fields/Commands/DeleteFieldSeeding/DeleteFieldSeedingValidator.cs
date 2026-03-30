using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldSeeding;

public class DeleteFieldSeedingValidator : AbstractValidator<DeleteFieldSeedingCommand>
{
    public DeleteFieldSeedingValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
