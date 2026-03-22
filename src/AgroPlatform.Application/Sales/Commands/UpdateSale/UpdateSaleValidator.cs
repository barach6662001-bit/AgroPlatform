using FluentValidation;

namespace AgroPlatform.Application.Sales.Commands.UpdateSale;

public class UpdateSaleValidator : AbstractValidator<UpdateSaleCommand>
{
    public UpdateSaleValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.BuyerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Product).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.PricePerUnit).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Date).NotEmpty();
    }
}
