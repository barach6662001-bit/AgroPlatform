using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldInspection;

public class CreateFieldInspectionValidator : AbstractValidator<CreateFieldInspectionCommand>
{
    public CreateFieldInspectionValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.InspectorName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Severity).MaximumLength(50).When(x => x.Severity != null);
        RuleFor(x => x.PhotoUrl).MaximumLength(500).When(x => x.PhotoUrl != null);
    }
}
