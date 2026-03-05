using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;

public class GetAgroOperationsValidator : AbstractValidator<GetAgroOperationsQuery>
{
    public GetAgroOperationsValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
