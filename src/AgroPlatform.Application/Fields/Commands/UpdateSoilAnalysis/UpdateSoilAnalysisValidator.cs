using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateSoilAnalysis;

public class UpdateSoilAnalysisValidator : AbstractValidator<UpdateSoilAnalysisCommand>
{
    public UpdateSoilAnalysisValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.SampleDate).NotEmpty();
        RuleFor(x => x.pH).InclusiveBetween(0, 14).When(x => x.pH.HasValue);
        RuleFor(x => x.Nitrogen).GreaterThanOrEqualTo(0).When(x => x.Nitrogen.HasValue);
        RuleFor(x => x.Phosphorus).GreaterThanOrEqualTo(0).When(x => x.Phosphorus.HasValue);
        RuleFor(x => x.Potassium).GreaterThanOrEqualTo(0).When(x => x.Potassium.HasValue);
        RuleFor(x => x.Humus).GreaterThanOrEqualTo(0).When(x => x.Humus.HasValue);
    }
}
