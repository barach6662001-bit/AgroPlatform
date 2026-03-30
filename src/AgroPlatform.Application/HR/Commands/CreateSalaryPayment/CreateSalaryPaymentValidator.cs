using FluentValidation;

namespace AgroPlatform.Application.HR.Commands.CreateSalaryPayment;

public class CreateSalaryPaymentValidator : AbstractValidator<CreateSalaryPaymentCommand>
{
    public CreateSalaryPaymentValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentDate).NotEmpty();
        RuleFor(x => x.PaymentType).NotEmpty().MaximumLength(50);
    }
}
