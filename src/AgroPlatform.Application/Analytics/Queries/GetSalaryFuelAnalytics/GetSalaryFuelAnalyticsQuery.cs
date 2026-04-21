using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetSalaryFuelAnalytics;

public record GetSalaryFuelAnalyticsQuery(int? Year) : IRequest<SalaryFuelAnalyticsDto>;
