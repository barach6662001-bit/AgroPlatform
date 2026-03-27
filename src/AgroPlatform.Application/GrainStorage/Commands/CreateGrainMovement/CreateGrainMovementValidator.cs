using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;

public class CreateGrainMovementValidator : AbstractValidator<CreateGrainMovementCommand>
{
    public CreateGrainMovementValidator()
    {
        RuleFor(x => x.GrainBatchId).NotEmpty();
        RuleFor(x => x.QuantityTons).GreaterThan(0);
        RuleFor(x => x.MovementType).IsInEnum();
    }
}
