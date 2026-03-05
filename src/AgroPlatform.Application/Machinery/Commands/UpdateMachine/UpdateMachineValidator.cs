using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.UpdateMachine;

public class UpdateMachineValidator : AbstractValidator<UpdateMachineCommand>
{
    public UpdateMachineValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).MaximumLength(100);
        RuleFor(x => x.Model).MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, 2100).When(x => x.Year.HasValue);
        RuleFor(x => x.FuelConsumptionPerHour).GreaterThan(0).When(x => x.FuelConsumptionPerHour.HasValue);
    }
}
