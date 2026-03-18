using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateLandLease;

public record UpdateLandLeaseCommand(
    Guid Id,
    string OwnerName,
    string? OwnerPhone,
    string? ContractNumber,
    decimal AnnualPayment,
    string PaymentType,
    decimal? GrainPaymentTons,
    DateTime? ContractEndDate,
    string? Notes,
    bool IsActive
) : IRequest;
