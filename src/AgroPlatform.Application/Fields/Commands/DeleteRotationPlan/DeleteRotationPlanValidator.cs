using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;

public class DeleteRotationPlanValidator : AbstractValidator<DeleteRotationPlanCommand>
{
    public DeleteRotationPlanValidator()
    {
        RuleFor(x => x.PlanId).NotEmpty();
    }
}
