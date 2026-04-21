using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;

public class UpdateFieldGeometryValidator : AbstractValidator<UpdateFieldGeometryCommand>
{
    public UpdateFieldGeometryValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.GeoJson)
            .NotEmpty()
            .MaximumLength(1_000_000)
            .WithMessage("GeoJson must not be empty and must be under 1 MB.");
    }
}
