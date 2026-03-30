using AgroPlatform.Application.Common.Models;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessions;

public record GetInventorySessionsQuery(
    Guid? WarehouseId,
    int Page,
    int PageSize
) : IRequest<PaginatedResult<InventorySessionDto>>;
