using FluentValidation;

namespace AgroPlatform.Application.GrainStorage.Commands.DeleteGrainStorage;

public class DeleteGrainStorageValidator : AbstractValidator<DeleteGrainStorageCommand>
{
    public DeleteGrainStorageValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
