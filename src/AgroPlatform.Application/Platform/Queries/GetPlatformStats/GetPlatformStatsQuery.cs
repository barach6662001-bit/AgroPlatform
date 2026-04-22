using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Platform.Queries.GetPlatformStats;

/// <summary>Platform-wide KPIs for the SuperAdmin control center.</summary>
public record PlatformStatsDto(
    int TotalCompanies,
    int ActiveCompanies,
    int TotalUsers,
    int ActiveUsers,
    int TotalFields,
    decimal TotalAreaHectares,
    int TotalOperations,
    int TotalMachines,
    int TotalWarehouses,
    int TotalEmployees);

public record GetPlatformStatsQuery : IRequest<PlatformStatsDto>;

public class GetPlatformStatsHandler : IRequestHandler<GetPlatformStatsQuery, PlatformStatsDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPlatformStatsHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PlatformStatsDto> Handle(GetPlatformStatsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can query platform stats.");

        // All queries bypass tenant query filters — stats are cross-tenant by design.
        var totalCompanies  = await _db.Tenants.IgnoreQueryFilters().CountAsync(cancellationToken);
        var activeCompanies = await _db.Tenants.IgnoreQueryFilters().CountAsync(t => t.IsActive, cancellationToken);
        var totalUsers      = await _db.Users.IgnoreQueryFilters().CountAsync(cancellationToken);
        var activeUsers     = await _db.Users.IgnoreQueryFilters().CountAsync(u => u.IsActive, cancellationToken);
        var totalFields     = await _db.Fields.IgnoreQueryFilters().CountAsync(f => !f.IsDeleted, cancellationToken);
        var totalArea       = await _db.Fields.IgnoreQueryFilters().Where(f => !f.IsDeleted).SumAsync(f => (decimal?)f.AreaHectares, cancellationToken) ?? 0m;
        var totalOperations = await _db.AgroOperations.IgnoreQueryFilters().CountAsync(o => !o.IsDeleted, cancellationToken);
        var totalMachines   = await _db.Machines.IgnoreQueryFilters().CountAsync(m => !m.IsDeleted, cancellationToken);
        var totalWarehouses = await _db.Warehouses.IgnoreQueryFilters().CountAsync(w => !w.IsDeleted, cancellationToken);
        var totalEmployees  = await _db.Employees.IgnoreQueryFilters().CountAsync(e => !e.IsDeleted, cancellationToken);

        return new PlatformStatsDto(
            totalCompanies, activeCompanies,
            totalUsers, activeUsers,
            totalFields, totalArea,
            totalOperations,
            totalMachines, totalWarehouses, totalEmployees);
    }
}
