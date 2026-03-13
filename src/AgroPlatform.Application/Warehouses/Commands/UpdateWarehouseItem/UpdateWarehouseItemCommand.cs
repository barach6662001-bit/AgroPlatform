using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.UpdateWarehouseItem;

public record UpdateWarehouseItemCommand(
    Guid Id,
    string Name,
    string Code,
    string Category,
    string BaseUnit,
    string? Description,
    decimal? MinimumQuantity
) : IRequest;
