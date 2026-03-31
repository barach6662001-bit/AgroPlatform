using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Tenants.DTOs;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Tenants.Queries.GetTenants;

public class GetTenantsHandler : IRequestHandler<GetTenantsQuery, List<TenantDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTenantsHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<TenantDto>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.IsSuperAdmin || _currentUser.IsInRole(UserRole.CompanyAdmin))
        {
            return await _db.Tenants
                .Where(t => t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new TenantDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Inn = t.Inn,
                    IsActive = t.IsActive,
                    CreatedAtUtc = t.CreatedAtUtc,
                    CompanyName = t.CompanyName,
                    Edrpou = t.Edrpou,
                    Address = t.Address,
                    Phone = t.Phone,
                })
                .ToListAsync(cancellationToken);
        }

        var tenantId = _currentUser.TenantId;
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive, cancellationToken);

        if (tenant == null)
            return new List<TenantDto>();

        return new List<TenantDto> { MapToDto(tenant) };
    }

    private static TenantDto MapToDto(Tenant t) => new TenantDto
    {
        Id = t.Id,
        Name = t.Name,
        Inn = t.Inn,
        IsActive = t.IsActive,
        CreatedAtUtc = t.CreatedAtUtc,
        CompanyName = t.CompanyName,
        Edrpou = t.Edrpou,
        Address = t.Address,
        Phone = t.Phone,
    };
}
