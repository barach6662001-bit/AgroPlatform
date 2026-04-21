using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Commands.CreateCostRecord;

public record CreateCostRecordCommand(
    CostCategory Category,
    decimal Amount,
    string Currency,
    DateTime Date,
    Guid? FieldId,
    Guid? AgroOperationId,
    string? Description
) : IRequest<Guid>;
