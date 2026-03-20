using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetSales;

public record GetSalesQuery(
    string? BuyerName,
    CropType? CropType,
    PaymentStatus? PaymentStatus,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<SaleDto>>;
