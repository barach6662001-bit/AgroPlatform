using AgroPlatform.Application.Sales.DTOs;
using MediatR;

namespace AgroPlatform.Application.Sales.Queries.GetSalesAnalytics;

public record GetSalesAnalyticsQuery(int? Year) : IRequest<SalesAnalyticsDto>;
