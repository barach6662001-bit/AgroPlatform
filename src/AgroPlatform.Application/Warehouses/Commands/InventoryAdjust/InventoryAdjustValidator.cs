using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;

public class InventoryAdjustValidator : AbstractValidator<InventoryAdjustCommand>
{
    public InventoryAdjustValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.ActualQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.UnitCode).NotEmpty().MaximumLength(20);
    }
}
