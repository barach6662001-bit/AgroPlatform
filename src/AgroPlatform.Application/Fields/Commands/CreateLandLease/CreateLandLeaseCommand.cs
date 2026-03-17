using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateLandLease;

public record CreateLandLeaseCommand(
    Guid FieldId,
    string OwnerName,
    string? OwnerPhone,
    string? ContractNumber,
    decimal AnnualPayment,
    string PaymentType,
    decimal? GrainPaymentTons,
    DateTime ContractStartDate,
    DateTime? ContractEndDate,
    string? Notes
) : IRequest<Guid>;
