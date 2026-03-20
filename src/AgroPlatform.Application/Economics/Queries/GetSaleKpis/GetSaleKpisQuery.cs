using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetSaleKpis;

public record GetSaleKpisQuery(
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<SaleKpiDto>;
