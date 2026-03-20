using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Tenants.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Tenants.Queries.GetCurrentTenant;

public class GetCurrentTenantHandler : IRequestHandler<GetCurrentTenantQuery, TenantDto>
{
    private readonly IAppDbContext _db;
    private readonly ITenantService _tenantService;

    public GetCurrentTenantHandler(IAppDbContext db, ITenantService tenantService)
    {
        _db = db;
        _tenantService = tenantService;
    }

    public async Task<TenantDto> Handle(GetCurrentTenantQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();

        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", tenantId);

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Inn = tenant.Inn,
            IsActive = tenant.IsActive,
            CreatedAtUtc = tenant.CreatedAtUtc,
            CompanyName = tenant.CompanyName,
            Edrpou = tenant.Edrpou,
            Address = tenant.Address,
            Phone = tenant.Phone,
        };
    }
}
