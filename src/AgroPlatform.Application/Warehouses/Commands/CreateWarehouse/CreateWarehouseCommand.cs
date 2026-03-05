using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;

public record CreateWarehouseCommand(
    string Name,
    string? Location
) : IRequest<Guid>;
