using FluentValidation;

namespace AgroPlatform.Application.Approval.Commands.CreateApprovalRule;

public class CreateApprovalRuleValidator : AbstractValidator<CreateApprovalRuleCommand>
{
    public CreateApprovalRuleValidator()
    {
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(128);
        RuleFor(x => x.RequiredRole).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Threshold).GreaterThanOrEqualTo(0);
    }
}
