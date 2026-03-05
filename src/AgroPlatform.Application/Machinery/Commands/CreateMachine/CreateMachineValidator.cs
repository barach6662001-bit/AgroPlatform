using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.CreateMachine;

public class CreateMachineValidator : AbstractValidator<CreateMachineCommand>
{
    public CreateMachineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.InventoryNumber).NotEmpty().MaximumLength(50);
    }
}
