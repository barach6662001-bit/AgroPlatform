using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.AddResource;

public class AddResourceValidator : AbstractValidator<AddResourceCommand>
{
    public AddResourceValidator()
    {
        RuleFor(x => x.AgroOperationId).NotEmpty();
        RuleFor(x => x.WarehouseItemId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.PlannedQuantity).GreaterThan(0);
        RuleFor(x => x.UnitCode).NotEmpty();
    }
}
