using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateField;

public class CreateFieldValidator : AbstractValidator<CreateFieldCommand>
{
    public CreateFieldValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AreaHectares).GreaterThan(0);
        RuleFor(x => x.CadastralNumber).MaximumLength(50).When(x => x.CadastralNumber != null);
        RuleFor(x => x.OwnershipType).InclusiveBetween(0, 2);
    }
}
