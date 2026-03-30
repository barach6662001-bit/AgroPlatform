using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldZone;

public class UpdateFieldZoneValidator : AbstractValidator<UpdateFieldZoneCommand>
{
    public UpdateFieldZoneValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SoilType).MaximumLength(100).When(x => x.SoilType != null);
    }
}
