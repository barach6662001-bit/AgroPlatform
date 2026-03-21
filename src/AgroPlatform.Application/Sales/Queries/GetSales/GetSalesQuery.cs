using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Sales.DTOs;
using MediatR;

namespace AgroPlatform.Application.Sales.Queries.GetSales;

public record GetSalesQuery(
    string? BuyerName,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<SaleDto>>;
