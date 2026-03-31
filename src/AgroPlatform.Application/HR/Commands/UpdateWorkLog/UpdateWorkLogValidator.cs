using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.UpdateWorkLog;

public class UpdateWorkLogValidator : AbstractValidator<UpdateWorkLogCommand>
{
    public UpdateWorkLogValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.WorkDate).NotEmpty();
        RuleFor(x => x.HoursWorked).GreaterThanOrEqualTo(0).When(x => x.HoursWorked.HasValue);
        RuleFor(x => x.UnitsProduced).GreaterThanOrEqualTo(0).When(x => x.UnitsProduced.HasValue);
        RuleFor(x => x.WorkDescription).MaximumLength(500).When(x => x.WorkDescription != null);
    }
}
