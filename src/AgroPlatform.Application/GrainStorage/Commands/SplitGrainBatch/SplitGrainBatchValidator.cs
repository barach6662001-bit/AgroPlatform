using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public class SplitGrainBatchValidator : AbstractValidator<SplitGrainBatchCommand>
{
    public SplitGrainBatchValidator()
    {
        RuleFor(x => x.SourceBatchId).NotEmpty();

        RuleFor(x => x.Targets)
            .NotEmpty()
            .WithMessage("At least one split target is required.");

        RuleForEach(x => x.Targets).ChildRules(target =>
        {
            target.RuleFor(t => t.TargetStorageId).NotEmpty();
            target.RuleFor(t => t.QuantityTons).GreaterThan(0);
        });
    }
}
