using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.SubmitInventorySession;

public record SubmitInventorySessionCommand(Guid SessionId) : IRequest;
