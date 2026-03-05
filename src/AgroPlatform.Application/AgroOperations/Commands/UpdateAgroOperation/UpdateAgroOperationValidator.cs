using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;

public class UpdateAgroOperationValidator : AbstractValidator<UpdateAgroOperationCommand>
{
    public UpdateAgroOperationValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
