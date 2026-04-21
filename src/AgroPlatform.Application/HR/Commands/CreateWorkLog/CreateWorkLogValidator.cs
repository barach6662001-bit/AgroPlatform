using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.CreateWorkLog;

public class CreateWorkLogValidator : AbstractValidator<CreateWorkLogCommand>
{
    public CreateWorkLogValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.WorkDate).NotEmpty();
        RuleFor(x => x.HoursWorked).GreaterThanOrEqualTo(0).When(x => x.HoursWorked.HasValue);
        RuleFor(x => x.UnitsProduced).GreaterThanOrEqualTo(0).When(x => x.UnitsProduced.HasValue);
        RuleFor(x => x.WorkDescription).MaximumLength(500).When(x => x.WorkDescription != null);
    }
}
