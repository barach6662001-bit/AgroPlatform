using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Companies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Companies.Queries.GetCompanies;

public class GetCompaniesHandler : IRequestHandler<GetCompaniesQuery, List<CompanyListDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCompaniesHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<CompanyListDto>> Handle(GetCompaniesQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can list companies.");

        var tenants = await _db.Tenants
            .IgnoreQueryFilters()
            .ToListAsync(cancellationToken);

        var userCounts = await _db.Users
            .IgnoreQueryFilters()
            .GroupBy(u => u.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TenantId, x => x.Count, cancellationToken);

        return tenants
            .Select(t => new CompanyListDto(
                t.Id,
                t.Name,
                t.CompanyName,
                t.Edrpou,
                t.Address,
                t.Phone,
                t.IsActive,
                userCounts.GetValueOrDefault(t.Id, 0),
                t.CreatedAtUtc))
            .OrderBy(t => t.Name)
            .ToList();
    }
}
