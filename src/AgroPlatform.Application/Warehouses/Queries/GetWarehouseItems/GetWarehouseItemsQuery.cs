using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;

public record GetWarehouseItemsQuery(string? Category) : IRequest<List<WarehouseItemDto>>;
