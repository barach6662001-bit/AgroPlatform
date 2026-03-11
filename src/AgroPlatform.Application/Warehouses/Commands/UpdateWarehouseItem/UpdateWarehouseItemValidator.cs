using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.UpdateWarehouseItem;

public class UpdateWarehouseItemValidator : AbstractValidator<UpdateWarehouseItemCommand>
{
    public UpdateWarehouseItemValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BaseUnit).NotEmpty().MaximumLength(20);
    }
}
