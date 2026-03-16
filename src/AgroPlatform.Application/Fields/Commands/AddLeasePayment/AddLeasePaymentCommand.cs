using MediatR;

namespace AgroPlatform.Application.Fields.Commands.AddLeasePayment;

public record AddLeasePaymentCommand(
    Guid LandLeaseId,
    int Year,
    decimal Amount,
    string PaymentType,
    DateTime PaymentDate,
    string? Notes
) : IRequest<Guid>;
