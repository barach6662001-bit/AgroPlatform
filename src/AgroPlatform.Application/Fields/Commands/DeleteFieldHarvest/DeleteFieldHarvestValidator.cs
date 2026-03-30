using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldHarvest;

public class DeleteFieldHarvestValidator : AbstractValidator<DeleteFieldHarvestCommand>
{
    public DeleteFieldHarvestValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
