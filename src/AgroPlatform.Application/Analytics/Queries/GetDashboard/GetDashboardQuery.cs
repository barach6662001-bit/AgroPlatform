using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetDashboard;

public record GetDashboardQuery() : IRequest<DashboardDto>;
