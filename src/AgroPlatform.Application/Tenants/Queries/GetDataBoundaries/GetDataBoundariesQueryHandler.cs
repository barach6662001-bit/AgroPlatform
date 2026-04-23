using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Tenants.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroPlatform.Application.Tenants.Queries.GetDataBoundaries;

public sealed class GetDataBoundariesQueryHandler : IRequestHandler<GetDataBoundariesQuery, TenantDataBoundariesDto>
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(1);

    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMemoryCache _cache;

    public GetDataBoundariesQueryHandler(IAppDbContext db, ICurrentUserService currentUser, IMemoryCache cache)
    {
        _db = db;
        _currentUser = currentUser;
        _cache = cache;
    }

    public async Task<TenantDataBoundariesDto> Handle(GetDataBoundariesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;
        var cacheKey = $"tenant-data-boundaries:{tenantId}";

        if (_cache.TryGetValue(cacheKey, out TenantDataBoundariesDto? cached) && cached is not null)
        {
            return cached;
        }

        var agroMin = await _db.AgroOperations
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)(x.CompletedDate ?? x.PlannedDate))
            .MinAsync(cancellationToken);

        var agroMax = await _db.AgroOperations
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)(x.CompletedDate ?? x.PlannedDate))
            .MaxAsync(cancellationToken);

        var costMin = await _db.CostRecords
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)x.Date)
            .MinAsync(cancellationToken);

        var costMax = await _db.CostRecords
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)x.Date)
            .MaxAsync(cancellationToken);

        var salesMin = await _db.Sales
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)x.Date)
            .MinAsync(cancellationToken);

        var salesMax = await _db.Sales
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (DateTime?)x.Date)
            .MaxAsync(cancellationToken);

        var mins = new[] { agroMin, costMin, salesMin }
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .ToArray();

        var maxes = new[] { agroMax, costMax, salesMax }
            .Where(d => d.HasValue)
            .Select(d => d!.Value)
            .ToArray();

        var response = new TenantDataBoundariesDto
        {
            MinOperationDate = mins.Length == 0 ? null : mins.Min(),
            MaxOperationDate = maxes.Length == 0 ? null : maxes.Max(),
        };

        _cache.Set(cacheKey, response, CacheTtl);
        return response;
    }
}
