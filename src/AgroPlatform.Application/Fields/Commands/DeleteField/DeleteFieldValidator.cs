using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteField;

public class DeleteFieldValidator : AbstractValidator<DeleteFieldCommand>
{
    public DeleteFieldValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
