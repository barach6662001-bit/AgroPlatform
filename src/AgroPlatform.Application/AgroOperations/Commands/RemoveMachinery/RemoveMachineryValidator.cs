using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveMachinery;

public class RemoveMachineryValidator : AbstractValidator<RemoveMachineryCommand>
{
    public RemoveMachineryValidator()
    {
        RuleFor(x => x.MachineryId).NotEmpty();
    }
}
