using AgroPlatform.Application.Tenants.DTOs;
using MediatR;

namespace AgroPlatform.Application.Tenants.Queries.GetTenants;

public record GetTenantsQuery : IRequest<List<TenantDto>>;
