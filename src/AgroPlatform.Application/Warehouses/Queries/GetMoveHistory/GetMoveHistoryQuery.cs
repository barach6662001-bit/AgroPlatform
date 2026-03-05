using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetMoveHistory;

public record GetMoveHistoryQuery(
    Guid? WarehouseId,
    Guid? ItemId,
    DateTime? DateFrom,
    DateTime? DateTo,
    StockMoveType? MoveType,
    int Page,
    int PageSize
) : IRequest<List<MoveHistoryDto>>;
