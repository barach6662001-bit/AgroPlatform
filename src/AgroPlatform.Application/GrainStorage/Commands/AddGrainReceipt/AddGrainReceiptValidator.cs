using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainReceipt;

public class AddGrainReceiptValidator : AbstractValidator<AddGrainReceiptCommand>
{
    public AddGrainReceiptValidator()
    {
        RuleFor(x => x.GrainBatchId).NotEmpty();
        RuleFor(x => x.GrainStorageId).NotEmpty();
        RuleFor(x => x.QuantityTons).GreaterThan(0);
        RuleFor(x => x.ReceivedDate).NotEmpty();
    }
}
