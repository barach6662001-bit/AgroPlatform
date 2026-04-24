using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Seasons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Tenant-scoped season management. Reads are available to any authenticated member
/// of the tenant; mutations require <c>CompanyAdmin</c> (or platform super-admin).
/// Replaces the legacy integer year-list endpoint with a proper typed Season model
/// (breaking change — see ROADMAP PR #612).
/// </summary>
[ApiController]
[Route("api/seasons")]
[Authorize]
[Produces("application/json")]
public sealed class SeasonsController : ControllerBase
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SeasonsController(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public record SeasonDto(
        Guid Id,
        string Code,
        string Name,
        DateOnly StartDate,
        DateOnly EndDate,
        bool IsCurrent);

    public record CreateSeasonRequest(string Code, string Name, DateOnly StartDate, DateOnly EndDate, bool IsCurrent);

    public record UpdateSeasonRequest(string Code, string Name, DateOnly StartDate, DateOnly EndDate);

    private bool IsTenantAdmin =>
        _currentUser.IsSuperAdmin || _currentUser.Role == UserRole.CompanyAdmin;

    private static SeasonDto ToDto(Season s) =>
        new(s.Id, s.Code, s.Name, s.StartDate, s.EndDate, s.IsCurrent);

    [HttpGet]
    [ProducesResponseType(typeof(List<SeasonDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var tenantId = _currentUser.TenantId;
        var items = await _db.Seasons
            .Where(s => s.TenantId == tenantId)
            .OrderBy(s => s.StartDate)
            .Select(s => new SeasonDto(s.Id, s.Code, s.Name, s.StartDate, s.EndDate, s.IsCurrent))
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SeasonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var tenantId = _currentUser.TenantId;
        var season = await _db.Seasons.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, ct);
        if (season is null) return NotFound();
        return Ok(ToDto(season));
    }

    [HttpGet("current")]
    [ProducesResponseType(typeof(SeasonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrent(CancellationToken ct)
    {
        var tenantId = _currentUser.TenantId;
        var season = await _db.Seasons
            .Where(s => s.TenantId == tenantId && s.IsCurrent)
            .Select(s => new SeasonDto(s.Id, s.Code, s.Name, s.StartDate, s.EndDate, s.IsCurrent))
            .FirstOrDefaultAsync(ct);
        if (season is null) return NotFound();
        return Ok(season);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SeasonDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateSeasonRequest req, CancellationToken ct)
    {
        if (!IsTenantAdmin) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Code)) return BadRequest(new { error = "Code is required." });
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { error = "Name is required." });
        if (req.Code.Length > 16) return BadRequest(new { error = "Code must be 16 characters or fewer." });
        if (req.Name.Length > 100) return BadRequest(new { error = "Name must be 100 characters or fewer." });
        if (req.EndDate <= req.StartDate) return BadRequest(new { error = "EndDate must be after StartDate." });

        var tenantId = _currentUser.TenantId;
        if (await _db.Seasons.AnyAsync(s => s.TenantId == tenantId && s.Code == req.Code, ct))
            return Conflict(new { error = "Season with this code already exists." });

        if (req.IsCurrent)
        {
            var currents = await _db.Seasons.Where(s => s.TenantId == tenantId && s.IsCurrent).ToListAsync(ct);
            foreach (var c in currents) c.IsCurrent = false;
            if (currents.Count > 0) await _db.SaveChangesAsync(ct);
        }

        var season = new Season
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Code = req.Code.Trim(),
            Name = req.Name.Trim(),
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            IsCurrent = req.IsCurrent,
        };
        _db.Seasons.Add(season);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = season.Id }, ToDto(season));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSeasonRequest req, CancellationToken ct)
    {
        if (!IsTenantAdmin) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Code)) return BadRequest(new { error = "Code is required." });
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { error = "Name is required." });
        if (req.Code.Length > 16) return BadRequest(new { error = "Code must be 16 characters or fewer." });
        if (req.Name.Length > 100) return BadRequest(new { error = "Name must be 100 characters or fewer." });
        if (req.EndDate <= req.StartDate) return BadRequest(new { error = "EndDate must be after StartDate." });

        var tenantId = _currentUser.TenantId;
        var season = await _db.Seasons.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, ct);
        if (season is null) return NotFound();

        if (season.Code != req.Code &&
            await _db.Seasons.AnyAsync(s => s.TenantId == tenantId && s.Code == req.Code && s.Id != id, ct))
            return Conflict(new { error = "Season with this code already exists." });

        season.Code = req.Code.Trim();
        season.Name = req.Name.Trim();
        season.StartDate = req.StartDate;
        season.EndDate = req.EndDate;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/set-current")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetCurrent(Guid id, CancellationToken ct)
    {
        if (!IsTenantAdmin) return Forbid();

        var tenantId = _currentUser.TenantId;
        var target = await _db.Seasons.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, ct);
        if (target is null) return NotFound();

        // Clear any other IsCurrent=true rows first, then flip the target in a second
        // SaveChanges. Two writes avoid transient violation of the partial unique index.
        var currents = await _db.Seasons.Where(s => s.TenantId == tenantId && s.IsCurrent && s.Id != id).ToListAsync(ct);
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

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] bool force, CancellationToken ct)
    {
        if (!IsTenantAdmin) return Forbid();

        var tenantId = _currentUser.TenantId;
        var season = await _db.Seasons.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, ct);
        if (season is null) return NotFound();

        // Current season can only be deleted by super-admin with explicit force=true.
        if (season.IsCurrent && !(force && _currentUser.IsSuperAdmin))
            return Conflict(new { error = "Cannot delete the current season. Set another season as current first." });

        var startDt = season.StartDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endDt = season.EndDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
        var hasCosts = await _db.CostRecords.AnyAsync(x => x.TenantId == tenantId && x.Date >= startDt && x.Date <= endDt, ct);
        var hasSales = await _db.Sales.AnyAsync(x => x.TenantId == tenantId && x.Date >= startDt && x.Date <= endDt, ct);
        var hasOps = await _db.AgroOperations.AnyAsync(x =>
            x.TenantId == tenantId &&
            ((x.CompletedDate ?? x.PlannedDate) >= startDt && (x.CompletedDate ?? x.PlannedDate) <= endDt), ct);

        // Linked records only block tenant-admin delete; super-admin with force=true may delete anyway.
        if ((hasCosts || hasSales || hasOps) && !(force && _currentUser.IsSuperAdmin))
            return Conflict(new { error = "Season has linked records (costs, sales or operations) within its date range." });

        season.IsDeleted = true;
        season.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
