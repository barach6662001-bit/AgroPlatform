using FluentValidation;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelSupply;

public class CreateFuelSupplyValidator : AbstractValidator<CreateFuelSupplyCommand>
{
    public CreateFuelSupplyValidator()
    {
        RuleFor(x => x.FuelTankId).NotEmpty();
        RuleFor(x => x.QuantityLiters).GreaterThan(0);
        RuleFor(x => x.PricePerLiter).GreaterThanOrEqualTo(0).When(x => x.PricePerLiter.HasValue);
        RuleFor(x => x.TransactionDate).NotEmpty();
        RuleFor(x => x.SupplierName).MaximumLength(200).When(x => x.SupplierName != null);
        RuleFor(x => x.InvoiceNumber).MaximumLength(100).When(x => x.InvoiceNumber != null);
    }
}
