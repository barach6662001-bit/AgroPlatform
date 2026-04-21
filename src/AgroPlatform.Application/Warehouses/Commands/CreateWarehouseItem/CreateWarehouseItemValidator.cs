using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouseItem;

public class CreateWarehouseItemValidator : AbstractValidator<CreateWarehouseItemCommand>
{
    public CreateWarehouseItemValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BaseUnit).NotEmpty().MaximumLength(20);
    }
}
