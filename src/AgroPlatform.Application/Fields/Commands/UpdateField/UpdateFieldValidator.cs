using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateField;

public class UpdateFieldValidator : AbstractValidator<UpdateFieldCommand>
{
    public UpdateFieldValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AreaHectares).GreaterThan(0);
        RuleFor(x => x.OwnershipType).InclusiveBetween(0, 2);
    }
}
