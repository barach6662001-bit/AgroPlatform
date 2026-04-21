using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.ApproveInventorySession;

public record ApproveInventorySessionCommand(Guid SessionId) : IRequest;
