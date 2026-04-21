using AgroPlatform.Application.Common.Models;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;

public record GetWarehouseItemsQuery(
    string? Category,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<WarehouseItemDto>>;
