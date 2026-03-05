using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;

public class CreateAgroOperationValidator : AbstractValidator<CreateAgroOperationCommand>
{
    public CreateAgroOperationValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.PlannedDate).NotEmpty();
    }
}
