using FluentValidation;

namespace AgroPlatform.Application.Warehouses.Commands.CreateItemCategory;

public class CreateItemCategoryValidator : AbstractValidator<CreateItemCategoryCommand>
{
    public CreateItemCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Code).MaximumLength(50).When(x => x.Code is not null);
    }
}
