using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.CancelAgroOperation;

public class CancelAgroOperationValidator : AbstractValidator<CancelAgroOperationCommand>
{
    public CancelAgroOperationValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
