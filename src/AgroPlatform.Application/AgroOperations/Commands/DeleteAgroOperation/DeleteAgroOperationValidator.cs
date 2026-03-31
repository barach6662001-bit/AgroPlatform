using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;

public class DeleteAgroOperationValidator : AbstractValidator<DeleteAgroOperationCommand>
{
    public DeleteAgroOperationValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
