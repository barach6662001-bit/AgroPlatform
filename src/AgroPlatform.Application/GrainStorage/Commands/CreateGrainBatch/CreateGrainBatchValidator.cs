using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;

public class CreateGrainBatchValidator : AbstractValidator<CreateGrainBatchCommand>
{
    public CreateGrainBatchValidator()
    {
        RuleFor(x => x.GrainStorageId).NotEmpty();
        RuleFor(x => x.GrainType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.InitialQuantityTons).GreaterThan(0);
        RuleFor(x => x.OwnerName).MaximumLength(200).When(x => x.OwnerName != null);
        RuleFor(x => x.ContractNumber).MaximumLength(100).When(x => x.ContractNumber != null);
        RuleFor(x => x.PricePerTon).GreaterThanOrEqualTo(0).When(x => x.PricePerTon.HasValue);
        RuleFor(x => x.ReceivedDate).NotEmpty();
        RuleFor(x => x.MoisturePercent).InclusiveBetween(0, 30).When(x => x.MoisturePercent.HasValue);
        RuleFor(x => x.ImpurityPercent).InclusiveBetween(0, 100).When(x => x.ImpurityPercent.HasValue);
        RuleFor(x => x.GrainImpurityPercent).InclusiveBetween(0, 100).When(x => x.GrainImpurityPercent.HasValue);
        RuleFor(x => x.ProteinPercent).InclusiveBetween(0, 100).When(x => x.ProteinPercent.HasValue);
        RuleFor(x => x.GlutenPercent).InclusiveBetween(0, 100).When(x => x.GlutenPercent.HasValue);
        RuleFor(x => x.NaturePerLiter).InclusiveBetween(400, 900).When(x => x.NaturePerLiter.HasValue);
        RuleFor(x => x.QualityClass).InclusiveBetween(1, 6).When(x => x.QualityClass.HasValue);
    }
}
