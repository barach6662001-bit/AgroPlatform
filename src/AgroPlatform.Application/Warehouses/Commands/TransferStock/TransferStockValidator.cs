using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public class TransferStockValidator : AbstractValidator<TransferStockCommand>
{
    public TransferStockValidator()
    {
        RuleFor(x => x.SourceWarehouseId).NotEmpty();
        RuleFor(x => x.DestinationWarehouseId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitCode).NotEmpty().MaximumLength(20);
    }
}
