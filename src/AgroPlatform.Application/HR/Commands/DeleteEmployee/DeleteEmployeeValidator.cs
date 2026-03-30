using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.DeleteEmployee;

public class DeleteEmployeeValidator : AbstractValidator<DeleteEmployeeCommand>
{
    public DeleteEmployeeValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
