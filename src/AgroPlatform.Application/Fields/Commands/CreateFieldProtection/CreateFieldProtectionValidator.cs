using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldProtection;

public class CreateFieldProtectionValidator : AbstractValidator<CreateFieldProtectionCommand>
{
    public CreateFieldProtectionValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000).LessThanOrEqualTo(2100);
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProtectionType).MaximumLength(100).When(x => x.ProtectionType != null);
        RuleFor(x => x.RateLPerHa).GreaterThan(0).When(x => x.RateLPerHa.HasValue);
        RuleFor(x => x.TotalLiters).GreaterThan(0).When(x => x.TotalLiters.HasValue);
        RuleFor(x => x.CostPerLiter).GreaterThanOrEqualTo(0).When(x => x.CostPerLiter.HasValue);
        RuleFor(x => x.TotalCost).GreaterThanOrEqualTo(0).When(x => x.TotalCost.HasValue);
        RuleFor(x => x.ApplicationDate).NotEmpty();
    }
}
