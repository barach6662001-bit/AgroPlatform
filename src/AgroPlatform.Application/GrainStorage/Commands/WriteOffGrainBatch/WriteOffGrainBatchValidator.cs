using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.WriteOffGrainBatch;

public class WriteOffGrainBatchValidator : AbstractValidator<WriteOffGrainBatchCommand>
{
    public WriteOffGrainBatchValidator()
    {
        RuleFor(x => x.BatchId).NotEmpty();
        RuleFor(x => x.QuantityTons).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty()
            .WithMessage("Reason is required for write-offs.");
    }
}
