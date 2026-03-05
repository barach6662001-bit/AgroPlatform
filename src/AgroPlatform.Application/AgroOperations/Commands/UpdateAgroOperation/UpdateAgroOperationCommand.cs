using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;

public record UpdateAgroOperationCommand(
    Guid Id,
    DateTime PlannedDate,
    string? Description,
    decimal? AreaProcessed
) : IRequest;
