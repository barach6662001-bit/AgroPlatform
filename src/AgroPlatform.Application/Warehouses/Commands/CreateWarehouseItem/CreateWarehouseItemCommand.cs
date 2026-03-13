using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouseItem;

public record CreateWarehouseItemCommand(
    string Name,
    string Code,
    string Category,
    string BaseUnit,
    string? Description,
    decimal? MinimumQuantity
) : IRequest<Guid>;
