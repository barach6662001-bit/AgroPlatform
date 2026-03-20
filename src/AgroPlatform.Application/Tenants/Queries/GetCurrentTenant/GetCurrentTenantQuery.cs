using AgroPlatform.Application.Tenants.DTOs;
using MediatR;

namespace AgroPlatform.Application.Tenants.Queries.GetCurrentTenant;

public record GetCurrentTenantQuery : IRequest<TenantDto>;
