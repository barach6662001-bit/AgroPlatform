using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;

public record CreateAgroOperationCommand(
    Guid FieldId,
    AgroOperationType OperationType,
    DateTime PlannedDate,
    string? Description,
    decimal? AreaProcessed
) : IRequest<Guid>;
