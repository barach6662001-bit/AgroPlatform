using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldSeeding;

public class CreateFieldSeedingValidator : AbstractValidator<CreateFieldSeedingCommand>
{
    public CreateFieldSeedingValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000).LessThanOrEqualTo(2100);
        RuleFor(x => x.CropName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Variety).MaximumLength(200).When(x => x.Variety != null);
        RuleFor(x => x.SeedingRateKgPerHa).GreaterThan(0).When(x => x.SeedingRateKgPerHa.HasValue);
        RuleFor(x => x.TotalSeedKg).GreaterThan(0).When(x => x.TotalSeedKg.HasValue);
    }
}
