using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;

public record CreateWarehouseCommand(
    string Name,
    string? Location,
    int? Type
) : IRequest<Guid>;
