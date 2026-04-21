using MediatR;

namespace AgroPlatform.Application.Fields.Commands.AddLeasePayment;

public record AddLeasePaymentCommand(
    Guid LandLeaseId,
    int Year,
    decimal Amount,
    string PaymentType,
    string PaymentMethod,
    DateTime PaymentDate,
    Guid? GrainBatchId,
    decimal? GrainQuantityTons,
    decimal? GrainPricePerTon,
    string? Notes
) : IRequest<Guid>;
