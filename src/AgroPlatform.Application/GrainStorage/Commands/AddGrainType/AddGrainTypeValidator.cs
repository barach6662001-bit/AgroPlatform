using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainType;

public class AddGrainTypeValidator : AbstractValidator<AddGrainTypeCommand>
{
    public AddGrainTypeValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
