using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;

public class AdjustGrainBatchValidator : AbstractValidator<AdjustGrainBatchCommand>
{
    public AdjustGrainBatchValidator()
    {
        RuleFor(x => x.BatchId).NotEmpty();
        RuleFor(x => x.AdjustmentTons).NotEqual(0)
            .WithMessage("Adjustment amount must be non-zero.");
    }
}
