using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.AddFuelLog;

public class AddFuelLogValidator : AbstractValidator<AddFuelLogCommand>
{
    public AddFuelLogValidator()
    {
        RuleFor(x => x.MachineId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
