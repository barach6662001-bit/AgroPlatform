using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldInspection;

public class DeleteFieldInspectionValidator : AbstractValidator<DeleteFieldInspectionCommand>
{
    public DeleteFieldInspectionValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
