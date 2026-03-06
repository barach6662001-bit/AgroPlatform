using AgroPlatform.Application.Common.Models;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetMoveHistory;

public record GetMoveHistoryQuery(
    Guid? WarehouseId,
    Guid? ItemId,
    DateTime? DateFrom,
    DateTime? DateTo,
    StockMoveType? MoveType,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<MoveHistoryDto>>;
