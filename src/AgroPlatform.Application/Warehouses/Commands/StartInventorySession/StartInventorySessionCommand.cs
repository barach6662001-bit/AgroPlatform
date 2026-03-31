using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.StartInventorySession;

public record StartInventorySessionCommand(Guid WarehouseId, string? Notes) : IRequest<Guid>;
