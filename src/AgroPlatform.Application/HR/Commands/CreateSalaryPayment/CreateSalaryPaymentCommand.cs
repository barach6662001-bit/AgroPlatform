using MediatR;

namespace AgroPlatform.Application.HR.Commands.CreateSalaryPayment;

public record CreateSalaryPaymentCommand(
    Guid EmployeeId,
    decimal Amount,
    DateTime PaymentDate,
    string PaymentType,
    string? Notes
) : IRequest<Guid>;
