using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldFertilizer;

public class DeleteFieldFertilizerValidator : AbstractValidator<DeleteFieldFertilizerCommand>
{
    public DeleteFieldFertilizerValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
