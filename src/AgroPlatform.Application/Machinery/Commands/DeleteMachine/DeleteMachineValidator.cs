using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.DeleteMachine;

public class DeleteMachineValidator : AbstractValidator<DeleteMachineCommand>
{
    public DeleteMachineValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
