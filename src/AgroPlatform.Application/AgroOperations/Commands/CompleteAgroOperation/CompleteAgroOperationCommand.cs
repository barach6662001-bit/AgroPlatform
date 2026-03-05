using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;

public record CompleteAgroOperationCommand(
    Guid Id,
    DateTime CompletedDate,
    decimal? AreaProcessed
) : IRequest;
