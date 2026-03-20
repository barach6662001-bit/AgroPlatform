using AgroPlatform.Application.Tenants.DTOs;
using MediatR;

namespace AgroPlatform.Application.Tenants.Commands.UpdateTenant;

public record UpdateTenantCommand(
    string? CompanyName,
    string? Edrpou,
    string? Address,
    string? Phone
) : IRequest<TenantDto>;
