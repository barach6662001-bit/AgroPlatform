using FluentValidation;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;

public class CreateFuelIssueValidator : AbstractValidator<CreateFuelIssueCommand>
{
    public CreateFuelIssueValidator()
    {
        RuleFor(x => x.FuelTankId).NotEmpty();
        RuleFor(x => x.QuantityLiters).GreaterThan(0);
        RuleFor(x => x.TransactionDate).NotEmpty();
        RuleFor(x => x.DriverName).MaximumLength(200).When(x => x.DriverName != null);
    }
}
