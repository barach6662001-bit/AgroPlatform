using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.AssignCrop;

public class AssignCropValidator : AbstractValidator<AssignCropCommand>
{
    public AssignCropValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000);
        RuleFor(x => x.Crop).IsInEnum();
    }
}
