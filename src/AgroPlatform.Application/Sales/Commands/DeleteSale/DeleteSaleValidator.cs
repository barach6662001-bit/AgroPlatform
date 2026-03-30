using FluentValidation;

namespace AgroPlatform.Application.Sales.Commands.DeleteSale;

public class DeleteSaleValidator : AbstractValidator<DeleteSaleCommand>
{
    public DeleteSaleValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
