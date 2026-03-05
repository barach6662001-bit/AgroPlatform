using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.AddWorkLog;

public class AddWorkLogValidator : AbstractValidator<AddWorkLogCommand>
{
    public AddWorkLogValidator()
    {
        RuleFor(x => x.MachineId).NotEmpty();
        RuleFor(x => x.HoursWorked).GreaterThan(0);
    }
}
