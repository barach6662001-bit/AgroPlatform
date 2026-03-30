using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveResource;

public class RemoveResourceValidator : AbstractValidator<RemoveResourceCommand>
{
    public RemoveResourceValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
    }
}
