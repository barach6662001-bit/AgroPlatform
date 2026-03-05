using MediatR;

namespace AgroPlatform.Application.Economics.Commands.CreateCostRecord;

public record CreateCostRecordCommand(
    string Category,
    decimal Amount,
    string Currency,
    DateTime Date,
    Guid? FieldId,
    Guid? AgroOperationId,
    string? Description
) : IRequest<Guid>;
