using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.UpdateEmployee;

public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Position).MaximumLength(200).When(x => x.Position != null);
        RuleFor(x => x.SalaryType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.HourlyRate).GreaterThanOrEqualTo(0).When(x => x.HourlyRate.HasValue);
        RuleFor(x => x.PieceworkRate).GreaterThanOrEqualTo(0).When(x => x.PieceworkRate.HasValue);
    }
}
