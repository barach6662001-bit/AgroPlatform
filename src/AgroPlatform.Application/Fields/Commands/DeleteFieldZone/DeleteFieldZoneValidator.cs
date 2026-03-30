using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldZone;

public class DeleteFieldZoneValidator : AbstractValidator<DeleteFieldZoneCommand>
{
    public DeleteFieldZoneValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
