using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.FeatureFlags;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroPlatform.Infrastructure.Services;

public sealed class FeatureFlagService : IFeatureFlagService
{
    private const int CacheTtlSeconds = 60;

    private readonly IAppDbContext _db;
    private readonly ITenantService _tenantService;
    private readonly IMemoryCache _cache;

    public FeatureFlagService(IAppDbContext db, ITenantService tenantService, IMemoryCache cache)
    {
        _db = db;
        _tenantService = tenantService;
        _cache = cache;
    }

    public async Task<bool> IsEnabledAsync(string key, CancellationToken cancellationToken = default)
    {
        var map = await GetCurrentTenantFeaturesAsync(cancellationToken);
        return map.TryGetValue(key, out var isEnabled) && isEnabled;
    }

    public async Task<IReadOnlyDictionary<string, bool>> GetCurrentTenantFeaturesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantService.GetTenantId();
        return await GetFeaturesForTenantAsync(tenantId, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<string, bool>> GetFeaturesForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(tenantId);
        if (_cache.TryGetValue(cacheKey, out IReadOnlyDictionary<string, bool>? cached) && cached is not null)
            return cached;

        var data = await LoadForTenantAsync(tenantId, cancellationToken);
        _cache.Set(cacheKey, data, TimeSpan.FromSeconds(CacheTtlSeconds));
        return data;
    }

    public void InvalidateTenant(Guid tenantId)
    {
        _cache.Remove(GetCacheKey(tenantId));
    }

    private async Task<IReadOnlyDictionary<string, bool>> LoadForTenantAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        // SuperAdmin requests without a concrete tenant context get all optional flags as disabled.
        if (tenantId == Guid.Empty)
            return BuildDisabledMap();

        var rows = await _db.TenantFeatureFlags
            .AsNoTracking()
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        // Backward compatibility: existing tenants without explicit rows keep optional features enabled.
        if (rows.Count == 0)
            return BuildEnabledMap();

        var defaults = BuildDisabledMap();

        foreach (var row in rows)
        {
            defaults[row.Key] = row.IsEnabled;
        }

        return defaults;
    }

    private static Dictionary<string, bool> BuildDisabledMap()
    {
        return OptionalFeatureFlagKeys.All.ToDictionary(k => k, _ => false, StringComparer.Ordinal);
    }

    private static Dictionary<string, bool> BuildEnabledMap()
    {
        return OptionalFeatureFlagKeys.All.ToDictionary(k => k, _ => true, StringComparer.Ordinal);
    }

    private static string GetCacheKey(Guid tenantId) => $"feature-flags:{tenantId:D}";
}