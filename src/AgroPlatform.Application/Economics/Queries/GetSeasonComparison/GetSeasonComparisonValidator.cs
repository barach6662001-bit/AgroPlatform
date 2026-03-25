using FluentValidation;

namespace AgroPlatform.Application.Economics.Queries.GetSeasonComparison;

public class GetSeasonComparisonValidator : AbstractValidator<GetSeasonComparisonQuery>
{
    public GetSeasonComparisonValidator()
    {
        RuleFor(x => x.Years)
            .Must(y => y == null || y.Length <= 10)
            .WithMessage("Cannot compare more than 10 seasons at once.");
    }
}
