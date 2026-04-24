using AgroPlatform.Api.SuperAdmin;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.FeatureFlags;
using AgroPlatform.Domain.Seasons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Platform-level super-admin endpoints. Every endpoint bypasses the tenant query filter via
/// <c>IgnoreQueryFilters()</c> and is gated by <see cref="SuperAdminRequiredAttribute"/>.
/// </summary>
[ApiController]
[Authorize]
[SuperAdminRequired]
[Route("api/admin")]
[Produces("application/json")]
public sealed class AdminController : ControllerBase
{
    private readonly IAppDbContext _db;
    private readonly IFeatureFlagService _features;
    private readonly ISuperAdminAuditService _audit;

    public AdminController(IAppDbContext db, IFeatureFlagService features, ISuperAdminAuditService audit)
    {
        _db = db;
        _features = features;
        _audit = audit;
    }

    public record TenantListItem(
        Guid Id,
        string Name,
        string? Edrpou,
        string Plan,
        int UserCount,
        int FieldCount,
        decimal TotalHectares,
        string Status,
        DateTime CreatedAt,
        DateTime? LastActiveAt);

    public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

    [HttpGet("tenants")]
    public async Task<IActionResult> ListTenants(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var tenantsQ = _db.Tenants.IgnoreQueryFilters().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            tenantsQ = tenantsQ.Where(t =>
                t.Name.ToLower().Contains(term) ||
                (t.Edrpou != null && t.Edrpou.ToLower().Contains(term)));
        }

        var total = await tenantsQ.CountAsync(ct);
        var pageItems = await tenantsQ
            .OrderByDescending(t => t.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new { t.Id, t.Name, t.Edrpou, t.IsActive, t.CreatedAtUtc })
            .ToListAsync(ct);

        var tenantIds = pageItems.Select(t => t.Id).ToList();

        // Aggregate counts across tenants — single round-trip per metric.
        var userCounts = await _db.Users
            .IgnoreQueryFilters()
            .Where(u => tenantIds.Contains(u.TenantId))
            .GroupBy(u => u.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var fieldStats = await _db.Fields
            .IgnoreQueryFilters()
            .Where(f => tenantIds.Contains(f.TenantId))
            .GroupBy(f => f.TenantId)
            .Select(g => new { TenantId = g.Key, Count = g.Count(), AreaSum = g.Sum(f => (decimal?)f.AreaHectares) ?? 0m })
            .ToListAsync(ct);

        var items = pageItems.Select(t =>
        {
            var uc = userCounts.FirstOrDefault(x => x.TenantId == t.Id)?.Count ?? 0;
            var fs = fieldStats.FirstOrDefault(x => x.TenantId == t.Id);
            return new TenantListItem(
                t.Id,
                t.Name,
                t.Edrpou,
                Plan: "basic",
                UserCount: uc,
                FieldCount: fs?.Count ?? 0,
                TotalHectares: fs?.AreaSum ?? 0m,
                Status: t.IsActive ? "active" : "suspended",
                CreatedAt: t.CreatedAtUtc,
                LastActiveAt: null);
        }).ToList();

        return Ok(new PagedResult<TenantListItem>(items, total, page, pageSize));
    }

    [HttpGet("tenants/{id:guid}")]
    public async Task<IActionResult> GetTenant(Guid id, CancellationToken ct)
    {
        var t = await _db.Tenants.IgnoreQueryFilters().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (t is null) return NotFound();

        var userCount = await _db.Users.IgnoreQueryFilters().CountAsync(u => u.TenantId == id, ct);
        var fieldCount = await _db.Fields.IgnoreQueryFilters().CountAsync(f => f.TenantId == id, ct);
        var totalHa = await _db.Fields.IgnoreQueryFilters().Where(f => f.TenantId == id).SumAsync(f => (decimal?)f.AreaHectares, ct) ?? 0m;

        return Ok(new TenantListItem(
            t.Id, t.Name, t.Edrpou, "basic",
            userCount, fieldCount, totalHa,
            t.IsActive ? "active" : "suspended",
            t.CreatedAtUtc, null));
    }

    [HttpGet("tenants/{id:guid}/features")]
    public async Task<IActionResult> GetFeatures(Guid id, CancellationToken ct)
    {
        var map = await _features.GetFeaturesForTenantAsync(id, ct);
        var payload = OptionalFeatureFlagKeys.All
            .Select(k => new { key = k, isEnabled = map.TryGetValue(k, out var v) && v })
            .ToList();
        return Ok(new { features = payload });
    }

    public record FeatureUpdate(string Key, bool IsEnabled);
    public record UpdateFeaturesRequest(List<FeatureUpdate> Features);

    [HttpPut("tenants/{id:guid}/features")]
    public async Task<IActionResult> UpdateFeatures(Guid id, [FromBody] UpdateFeaturesRequest request, CancellationToken ct)
    {
        var tenant = await _db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tenant is null) return NotFound();

        var before = await _features.GetFeaturesForTenantAsync(id, ct);
        var beforeSnapshot = before.ToDictionary(kv => kv.Key, kv => kv.Value);

        var existing = await _db.TenantFeatureFlags.IgnoreQueryFilters()
            .Where(x => x.TenantId == id)
            .ToListAsync(ct);

        var validKeys = new HashSet<string>(OptionalFeatureFlagKeys.All, StringComparer.Ordinal);

        foreach (var upd in request.Features)
        {
            if (!validKeys.Contains(upd.Key)) continue;
            var row = existing.FirstOrDefault(r => r.Key == upd.Key);
            if (row is null)
            {
                _db.TenantFeatureFlags.Add(new TenantFeatureFlag
                {
                    TenantId = id,
                    Key = upd.Key,
                    IsEnabled = upd.IsEnabled,
                });
            }
            else
            {
                row.IsEnabled = upd.IsEnabled;
            }
        }
        await _db.SaveChangesAsync(ct);

        _features.InvalidateTenant(id);

        var after = await _features.GetFeaturesForTenantAsync(id, ct);
        var afterSnapshot = after.ToDictionary(kv => kv.Key, kv => kv.Value);

        await _audit.LogAsync(
            action: "tenant.features.update",
            targetType: nameof(Domain.Users.Tenant),
            targetId: id.ToString(),
            before: beforeSnapshot,
            after: afterSnapshot,
            cancellationToken: ct);

        var payload = OptionalFeatureFlagKeys.All
            .Select(k => new { key = k, isEnabled = afterSnapshot.TryGetValue(k, out var v) && v })
            .ToList();
        return Ok(new { features = payload });
    }

    [HttpGet("audit-log")]
    public async Task<IActionResult> ListAuditLog(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.SuperAdminAuditLogs.AsNoTracking().OrderByDescending(x => x.OccurredAt);
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id, x.AdminUserId, x.Action, x.TargetType, x.TargetId,
                x.Before, x.After, x.IpAddress, x.UserAgent, x.OccurredAt,
            })
            .ToListAsync(ct);

        return Ok(new { items, total, page, pageSize });
    }

    // =============================================================================================
    // Seasons (platform super-admin scope). Bypasses tenant filter, audits every mutation.
    // =============================================================================================

    public record AdminSeasonDto(Guid Id, string Code, string Name, DateOnly StartDate, DateOnly EndDate, bool IsCurrent);
    public record AdminCreateSeasonRequest(string Code, string Name, DateOnly StartDate, DateOnly EndDate, bool IsCurrent);
    public record AdminUpdateSeasonRequest(string Code, string Name, DateOnly StartDate, DateOnly EndDate);

    [HttpGet("tenants/{tenantId:guid}/seasons")]
    public async Task<IActionResult> ListTenantSeasons(Guid tenantId, CancellationToken ct)
    {
        var items = await _db.Seasons
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId && !s.IsDeleted)
            .OrderBy(s => s.StartDate)
            .Select(s => new AdminSeasonDto(s.Id, s.Code, s.Name, s.StartDate, s.EndDate, s.IsCurrent))
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("tenants/{tenantId:guid}/seasons")]
    public async Task<IActionResult> CreateTenantSeason(Guid tenantId, [FromBody] AdminCreateSeasonRequest req, CancellationToken ct)
    {
        if (req.EndDate <= req.StartDate) return BadRequest(new { error = "EndDate must be after StartDate." });
        if (!await _db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == tenantId, ct))
            return NotFound();
        if (await _db.Seasons.IgnoreQueryFilters().AnyAsync(s => s.TenantId == tenantId && s.Code == req.Code && !s.IsDeleted, ct))
            return Conflict(new { error = "Season with this code already exists." });

        if (req.IsCurrent)
        {
            var currents = await _db.Seasons.IgnoreQueryFilters()
                .Where(s => s.TenantId == tenantId && s.IsCurrent && !s.IsDeleted).ToListAsync(ct);
            foreach (var c in currents) c.IsCurrent = false;
            if (currents.Count > 0) await _db.SaveChangesAsync(ct);
        }

        var season = new Season
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Code = req.Code,
            Name = req.Name,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            IsCurrent = req.IsCurrent,
        };
        _db.Seasons.Add(season);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync("season.create", nameof(Season), season.Id.ToString(), before: null,
            after: new AdminSeasonDto(season.Id, season.Code, season.Name, season.StartDate, season.EndDate, season.IsCurrent), ct);

        return Created($"/api/admin/tenants/{tenantId}/seasons/{season.Id}",
            new AdminSeasonDto(season.Id, season.Code, season.Name, season.StartDate, season.EndDate, season.IsCurrent));
    }

    [HttpPut("tenants/{tenantId:guid}/seasons/{id:guid}")]
    public async Task<IActionResult> UpdateTenantSeason(Guid tenantId, Guid id, [FromBody] AdminUpdateSeasonRequest req, CancellationToken ct)
    {
        if (req.EndDate <= req.StartDate) return BadRequest(new { error = "EndDate must be after StartDate." });
        var season = await _db.Seasons.IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && !s.IsDeleted, ct);
        if (season is null) return NotFound();

        if (season.Code != req.Code &&
            await _db.Seasons.IgnoreQueryFilters().AnyAsync(s => s.TenantId == tenantId && s.Code == req.Code && s.Id != id && !s.IsDeleted, ct))
            return Conflict(new { error = "Season with this code already exists." });

        var before = new AdminSeasonDto(season.Id, season.Code, season.Name, season.StartDate, season.EndDate, season.IsCurrent);
        season.Code = req.Code;
        season.Name = req.Name;
        season.StartDate = req.StartDate;
        season.EndDate = req.EndDate;
        await _db.SaveChangesAsync(ct);

        var after = new AdminSeasonDto(season.Id, season.Code, season.Name, season.StartDate, season.EndDate, season.IsCurrent);
        await _audit.LogAsync("season.update", nameof(Season), season.Id.ToString(), before, after, ct);
        return NoContent();
    }

    [HttpPost("tenants/{tenantId:guid}/seasons/{id:guid}/set-current")]
    public async Task<IActionResult> SetCurrentTenantSeason(Guid tenantId, Guid id, CancellationToken ct)
    {
        var target = await _db.Seasons.IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && !s.IsDeleted, ct);
        if (target is null) return NotFound();

        var before = new AdminSeasonDto(target.Id, target.Code, target.Name, target.StartDate, target.EndDate, target.IsCurrent);

        var currents = await _db.Seasons.IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId && s.IsCurrent && s.Id != id && !s.IsDeleted).ToListAsync(ct);
        if (currents.Count > 0)
        {
            foreach (var c in currents) c.IsCurrent = false;
            await _db.SaveChangesAsync(ct);
        }
        if (!target.IsCurrent)
        {
            target.IsCurrent = true;
            await _db.SaveChangesAsync(ct);
        }

        var after = new AdminSeasonDto(target.Id, target.Code, target.Name, target.StartDate, target.EndDate, target.IsCurrent);
        await _audit.LogAsync("season.set-current", nameof(Season), target.Id.ToString(), before, after, ct);
        return NoContent();
    }

    [HttpDelete("tenants/{tenantId:guid}/seasons/{id:guid}")]
    public async Task<IActionResult> DeleteTenantSeason(Guid tenantId, Guid id, [FromQuery] bool force, CancellationToken ct)
    {
        var season = await _db.Seasons.IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && !s.IsDeleted, ct);
        if (season is null) return NotFound();

        if (season.IsCurrent && !force)
            return Conflict(new { error = "Cannot delete the current season without force=true." });

        var before = new AdminSeasonDto(season.Id, season.Code, season.Name, season.StartDate, season.EndDate, season.IsCurrent);

        season.IsDeleted = true;
        season.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync("season.delete", nameof(Season), season.Id.ToString(), before, after: null, ct);
        return NoContent();
    }
}
