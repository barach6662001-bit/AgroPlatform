using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.AddLeasePayment;

public class AddLeasePaymentValidator : AbstractValidator<AddLeasePaymentCommand>
{
    public AddLeasePaymentValidator()
    {
        RuleFor(x => x.LandLeaseId).NotEmpty();
        RuleFor(x => x.Year).GreaterThan(2000).LessThanOrEqualTo(2100);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PaymentMethod).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PaymentDate).NotEmpty();
        RuleFor(x => x.GrainQuantityTons).GreaterThan(0).When(x => x.GrainQuantityTons.HasValue);
        RuleFor(x => x.GrainPricePerTon).GreaterThan(0).When(x => x.GrainPricePerTon.HasValue);
    }
}
