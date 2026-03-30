using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CompleteInventorySession;

public record CompleteInventorySessionCommand(Guid SessionId) : IRequest;
