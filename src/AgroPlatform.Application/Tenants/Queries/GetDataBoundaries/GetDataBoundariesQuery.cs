using AgroPlatform.Application.Tenants.DTOs;
using MediatR;

namespace AgroPlatform.Application.Tenants.Queries.GetDataBoundaries;

/// <summary>
/// Returns the earliest / latest operational date for the current tenant,
/// used by the dashboard to disable the <c>‹</c> <c>›</c> anchor-stepping
/// arrows when the user is already at the edge of their data.
/// </summary>
public record GetDataBoundariesQuery : IRequest<TenantDataBoundariesDto>;
