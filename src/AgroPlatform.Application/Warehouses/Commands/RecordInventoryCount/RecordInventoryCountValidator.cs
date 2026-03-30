using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.RecordInventoryCount;

public class RecordInventoryCountValidator : AbstractValidator<RecordInventoryCountCommand>
{
    public RecordInventoryCountValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.ActualQuantity).GreaterThanOrEqualTo(0);
    }
}
