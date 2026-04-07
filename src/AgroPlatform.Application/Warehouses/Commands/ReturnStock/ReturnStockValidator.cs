using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.ReturnStock;

public class ReturnStockValidator : AbstractValidator<ReturnStockCommand>
{
    public ReturnStockValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitCode).NotEmpty().MaximumLength(10);
    }
}
