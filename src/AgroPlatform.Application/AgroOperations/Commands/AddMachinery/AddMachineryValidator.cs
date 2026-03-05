using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.AddMachinery;

public class AddMachineryValidator : AbstractValidator<AddMachineryCommand>
{
    public AddMachineryValidator()
    {
        RuleFor(x => x.AgroOperationId).NotEmpty();
        RuleFor(x => x.MachineId).NotEmpty();
    }
}
