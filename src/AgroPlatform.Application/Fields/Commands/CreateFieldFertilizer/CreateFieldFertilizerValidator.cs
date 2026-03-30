using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldFertilizer;

public class CreateFieldFertilizerValidator : AbstractValidator<CreateFieldFertilizerCommand>
{
    public CreateFieldFertilizerValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000).LessThanOrEqualTo(2100);
        RuleFor(x => x.FertilizerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ApplicationType).MaximumLength(100).When(x => x.ApplicationType != null);
        RuleFor(x => x.RateKgPerHa).GreaterThan(0).When(x => x.RateKgPerHa.HasValue);
        RuleFor(x => x.TotalKg).GreaterThan(0).When(x => x.TotalKg.HasValue);
        RuleFor(x => x.CostPerKg).GreaterThanOrEqualTo(0).When(x => x.CostPerKg.HasValue);
        RuleFor(x => x.TotalCost).GreaterThanOrEqualTo(0).When(x => x.TotalCost.HasValue);
        RuleFor(x => x.ApplicationDate).NotEmpty();
    }
}
