using AgroPlatform.Application.Common.Models;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetBalance;

public record GetBalanceQuery(
    Guid? WarehouseId,
    Guid? ItemId,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<BalanceDto>>;
