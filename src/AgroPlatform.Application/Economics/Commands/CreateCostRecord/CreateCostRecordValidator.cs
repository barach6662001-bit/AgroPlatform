using FluentValidation;

namespace AgroPlatform.Application.Economics.Commands.CreateCostRecord;

public class CreateCostRecordValidator : AbstractValidator<CreateCostRecordCommand>
{
    public CreateCostRecordValidator()
    {
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Date).NotEmpty();
    }
}
