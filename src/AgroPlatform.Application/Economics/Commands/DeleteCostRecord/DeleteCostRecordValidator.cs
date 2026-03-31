using FluentValidation;

namespace AgroPlatform.Application.Economics.Commands.DeleteCostRecord;

public class DeleteCostRecordValidator : AbstractValidator<DeleteCostRecordCommand>
{
    public DeleteCostRecordValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
