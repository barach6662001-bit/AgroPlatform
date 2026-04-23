using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetDashboard;

/// <summary>
/// Returns aggregated dashboard figures. When <see cref="FromUtc"/> and
/// <see cref="ToUtc"/> are provided, all period-sensitive economics
/// (costs, revenue, profit, cost trend) are restricted to the half-open
/// <c>[FromUtc, ToUtc)</c> range. Otherwise legacy behavior is kept:
/// all-time totals, current calendar month for <c>Monthly*</c> figures,
/// last 12 months for the cost trend.
/// </summary>
public record GetDashboardQuery(DateTime? FromUtc = null, DateTime? ToUtc = null) : IRequest<DashboardDto>;
