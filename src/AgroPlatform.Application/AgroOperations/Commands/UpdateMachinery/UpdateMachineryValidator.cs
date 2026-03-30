using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateMachinery;

public class UpdateMachineryValidator : AbstractValidator<UpdateMachineryCommand>
{
    public UpdateMachineryValidator()
    {
        RuleFor(x => x.MachineryId).NotEmpty();
        RuleFor(x => x.HoursWorked).GreaterThanOrEqualTo(0).When(x => x.HoursWorked.HasValue);
        RuleFor(x => x.FuelUsed).GreaterThanOrEqualTo(0).When(x => x.FuelUsed.HasValue);
        RuleFor(x => x.OperatorName).MaximumLength(200).When(x => x.OperatorName != null);
    }
}
