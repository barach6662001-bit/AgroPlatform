using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public class SplitGrainBatchValidator : AbstractValidator<SplitGrainBatchCommand>
{
    public SplitGrainBatchValidator()
    {
        RuleFor(x => x.SourceBatchId).NotEmpty();
        RuleFor(x => x.SplitQuantityTons).GreaterThan(0);
    }
}
