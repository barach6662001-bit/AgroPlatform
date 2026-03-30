using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainStorage;

public class CreateGrainStorageValidator : AbstractValidator<CreateGrainStorageCommand>
{
    public CreateGrainStorageValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).MaximumLength(50).When(x => x.Code != null);
        RuleFor(x => x.Location).MaximumLength(500).When(x => x.Location != null);
        RuleFor(x => x.StorageType).MaximumLength(100).When(x => x.StorageType != null);
        RuleFor(x => x.CapacityTons).GreaterThan(0).When(x => x.CapacityTons.HasValue);
    }
}
