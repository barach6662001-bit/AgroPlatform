using FluentValidation;

namespace AgroPlatform.Application.Economics.Commands.UpsertBudget;

public class UpsertBudgetValidator : AbstractValidator<UpsertBudgetCommand>
{
    public UpsertBudgetValidator()
    {
        RuleFor(x => x.Year).InclusiveBetween(2000, 2100);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PlannedAmount).GreaterThan(0);
    }
}
