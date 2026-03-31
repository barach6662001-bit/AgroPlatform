using FluentValidation;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateResourceActual;

public class UpdateResourceActualValidator : AbstractValidator<UpdateResourceActualCommand>
{
    public UpdateResourceActualValidator()
    {
        RuleFor(x => x.ResourceId).NotEmpty();
        RuleFor(x => x.ActualQuantity).GreaterThanOrEqualTo(0);
    }
}
