using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;

public class AdjustGrainBatchValidator : AbstractValidator<AdjustGrainBatchCommand>
{
    public AdjustGrainBatchValidator()
    {
        RuleFor(x => x.BatchId).NotEmpty();
        RuleFor(x => x.AdjustmentTons).NotEqual(0m)
            .WithMessage("Adjustment quantity must not be zero.");
        RuleFor(x => x.Reason).NotEmpty()
            .WithMessage("Reason is required for adjustments.");
    }
}
