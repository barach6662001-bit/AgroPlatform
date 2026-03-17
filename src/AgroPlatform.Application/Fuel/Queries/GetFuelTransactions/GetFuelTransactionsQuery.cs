using AgroPlatform.Application.Fuel.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelTransactions;

public record GetFuelTransactionsQuery(
    Guid? TankId,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 50
) : IRequest<List<FuelTransactionDto>>;
