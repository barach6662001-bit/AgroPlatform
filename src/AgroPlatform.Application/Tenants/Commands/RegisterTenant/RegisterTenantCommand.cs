using AgroPlatform.Application.Tenants.DTOs;
using MediatR;

namespace AgroPlatform.Application.Tenants.Commands.RegisterTenant;

public record RegisterTenantCommand(
    string Name,
    string? Inn
) : IRequest<TenantDto>;
