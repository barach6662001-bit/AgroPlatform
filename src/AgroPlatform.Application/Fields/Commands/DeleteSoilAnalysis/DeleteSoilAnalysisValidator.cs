using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.DeleteSoilAnalysis;

public class DeleteSoilAnalysisValidator : AbstractValidator<DeleteSoilAnalysisCommand>
{
    public DeleteSoilAnalysisValidator()
    {
        RuleFor(x => x.FieldId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
    }
}
