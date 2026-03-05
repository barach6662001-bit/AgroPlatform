using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetBalance;

public record GetBalanceQuery(Guid WarehouseId, Guid? ItemId) : IRequest<List<BalanceDto>>;
