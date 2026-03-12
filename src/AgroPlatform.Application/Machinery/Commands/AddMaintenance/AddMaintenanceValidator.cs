using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.AddMaintenance;

public class AddMaintenanceValidator : AbstractValidator<AddMaintenanceCommand>
{
    public AddMaintenanceValidator()
    {
        RuleFor(x => x.MachineId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Type).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Cost).GreaterThan(0).When(x => x.Cost.HasValue);
        RuleFor(x => x.HoursAtMaintenance).GreaterThan(0).When(x => x.HoursAtMaintenance.HasValue);
    }
}
