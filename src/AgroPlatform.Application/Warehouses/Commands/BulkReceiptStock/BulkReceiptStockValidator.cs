using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.BulkReceiptStock;

public class BulkReceiptStockValidator : AbstractValidator<BulkReceiptStockCommand>
{
    public BulkReceiptStockValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty().WithMessage("At least one line is required.");
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ItemId).NotEmpty();
            line.RuleFor(l => l.Quantity).GreaterThan(0);
            line.RuleFor(l => l.UnitCode).NotEmpty().MaximumLength(10);
        });
    }
}
