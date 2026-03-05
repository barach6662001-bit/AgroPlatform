using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.PlanRotation;

public class PlanRotationValidator : AbstractValidator<PlanRotationCommand>
{
    public PlanRotationValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000);
    }
}
