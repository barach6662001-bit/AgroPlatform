using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.StartInventorySession;

public class StartInventorySessionValidator : AbstractValidator<StartInventorySessionCommand>
{
    public StartInventorySessionValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
    }
}
