using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldHarvest;

public class CreateFieldHarvestValidator : AbstractValidator<CreateFieldHarvestCommand>
{
    public CreateFieldHarvestValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000).LessThanOrEqualTo(2100);
        RuleFor(x => x.CropName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TotalTons).GreaterThan(0);
        RuleFor(x => x.MoisturePercent).InclusiveBetween(0, 100).When(x => x.MoisturePercent.HasValue);
        RuleFor(x => x.PricePerTon).GreaterThanOrEqualTo(0).When(x => x.PricePerTon.HasValue);
        RuleFor(x => x.HarvestDate).NotEmpty();
    }
}
