using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetFuelAnalytics;

public record GetFuelAnalyticsQuery() : IRequest<FuelAnalyticsDto>;
