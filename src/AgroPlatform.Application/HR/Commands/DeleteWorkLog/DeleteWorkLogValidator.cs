using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.DeleteWorkLog;

public class DeleteWorkLogValidator : AbstractValidator<DeleteWorkLogCommand>
{
    public DeleteWorkLogValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
