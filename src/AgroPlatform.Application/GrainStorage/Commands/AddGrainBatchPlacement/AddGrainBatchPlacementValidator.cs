using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainBatchPlacement;

public class AddGrainBatchPlacementValidator : AbstractValidator<AddGrainBatchPlacementCommand>
{
    public AddGrainBatchPlacementValidator()
    {
        RuleFor(x => x.GrainBatchId).NotEmpty();
        RuleFor(x => x.GrainStorageId).NotEmpty();
        RuleFor(x => x.QuantityTons).GreaterThan(0);
    }
}
