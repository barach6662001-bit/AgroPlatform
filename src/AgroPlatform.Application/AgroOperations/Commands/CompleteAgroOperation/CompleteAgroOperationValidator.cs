using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;

public class CompleteAgroOperationValidator : AbstractValidator<CompleteAgroOperationCommand>
{
    public CompleteAgroOperationValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CompletedDate).NotEmpty();
        RuleFor(x => x.AreaProcessed).GreaterThan(0).When(x => x.AreaProcessed.HasValue);
    }
}
