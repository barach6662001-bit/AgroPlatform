using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldZone;

public class CreateFieldZoneValidator : AbstractValidator<CreateFieldZoneCommand>
{
    public CreateFieldZoneValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SoilType).MaximumLength(100).When(x => x.SoilType != null);
    }
}
