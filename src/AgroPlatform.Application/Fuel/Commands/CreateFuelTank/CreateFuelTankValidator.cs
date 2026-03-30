using FluentValidation;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelTank;

public class CreateFuelTankValidator : AbstractValidator<CreateFuelTankCommand>
{
    public CreateFuelTankValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CapacityLiters).GreaterThan(0);
    }
}
