using FluentValidation;

namespace AgroPlatform.Application.Economics.Queries.GetBreakEven;

public class GetBreakEvenValidator : AbstractValidator<GetBreakEvenQuery>
{
    public GetBreakEvenValidator()
    {
        RuleFor(x => x.PricePerTonne)
            .GreaterThan(0)
            .WithMessage("PricePerTonne must be greater than 0.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100)
            .When(x => x.Year.HasValue)
            .WithMessage("Year must be between 2000 and 2100.");
    }
}
