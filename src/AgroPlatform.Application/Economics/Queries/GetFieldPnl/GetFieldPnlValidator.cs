using FluentValidation;

namespace AgroPlatform.Application.Economics.Queries.GetFieldPnl;

public class GetFieldPnlValidator : AbstractValidator<GetFieldPnlQuery>
{
    public GetFieldPnlValidator()
    {
        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100)
            .When(x => x.Year.HasValue)
            .WithMessage("Year must be between 2000 and 2100.");

        RuleFor(x => x.EstimatedPricePerTonne)
            .GreaterThan(0)
            .When(x => x.EstimatedPricePerTonne.HasValue)
            .WithMessage("EstimatedPricePerTonne must be greater than 0.");
    }
}
