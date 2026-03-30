using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateLandLease;

public class UpdateLandLeaseValidator : AbstractValidator<UpdateLandLeaseCommand>
{
    public UpdateLandLeaseValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.OwnerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OwnerPhone).MaximumLength(50).When(x => x.OwnerPhone != null);
        RuleFor(x => x.ContractNumber).MaximumLength(100).When(x => x.ContractNumber != null);
        RuleFor(x => x.AnnualPayment).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PaymentType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.GrainPaymentTons).GreaterThan(0).When(x => x.GrainPaymentTons.HasValue);
    }
}
