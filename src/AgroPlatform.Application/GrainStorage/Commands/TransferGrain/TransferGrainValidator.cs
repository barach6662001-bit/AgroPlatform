using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.TransferGrain;

public class TransferGrainValidator : AbstractValidator<TransferGrainCommand>
{
    public TransferGrainValidator()
    {
        RuleFor(x => x.SourceBatchId).NotEmpty();
        RuleFor(x => x.TargetBatchId).NotEmpty();
        RuleFor(x => x.QuantityTons).GreaterThan(0);
        RuleFor(x => x).Must(x => x.SourceBatchId != x.TargetBatchId)
            .WithMessage("Source and target batch must be different.");
    }
}
