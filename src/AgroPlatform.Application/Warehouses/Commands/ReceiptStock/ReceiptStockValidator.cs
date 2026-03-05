using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.ReceiptStock;

public class ReceiptStockValidator : AbstractValidator<ReceiptStockCommand>
{
    public ReceiptStockValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitCode).NotEmpty().MaximumLength(20);
    }
}
