using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Currency preferences and exchange rates. Base currency in DB is always UAH;
/// this controller exposes stored NBU rates and the signed-in user's display preference.
/// See ROADMAP.md "Decisions locked / Currency".
/// </summary>
[ApiController]
[Authorize]
[Route("api/currency")]
[Produces("application/json")]
public sealed class CurrencyController : ControllerBase
{
    private static readonly string[] AllowedCodes = { "UAH", "USD", "EUR" };
    private static readonly string[] TrackedCodes = { "USD", "EUR" };

    private readonly IAppDbContext _db;
    private readonly INbuCurrencyService _nbu;

    public CurrencyController(IAppDbContext db, INbuCurrencyService nbu)
    {
        _db = db;
        _nbu = nbu;
    }

    public record RateDto(string Code, DateOnly Date, decimal RateToUah);
    public record PreferencesDto(string PreferredCurrency);
    public record UpdatePreferencesRequest(string PreferredCurrency);

    /// <summary>Latest stored rates for tracked currencies (USD, EUR).</summary>
    [HttpGet("rates/latest")]
    public async Task<IActionResult> GetLatestRates(CancellationToken ct)
    {
        var rows = await _db.ExchangeRates
            .Where(r => TrackedCodes.Contains(r.Code))
            .GroupBy(r => r.Code)
            .Select(g => g.OrderByDescending(r => r.Date).First())
            .Select(r => new RateDto(r.Code, r.Date, r.RateToUah))
            .ToListAsync(ct);
        return Ok(rows);
    }

    /// <summary>Rate for <paramref name="code"/> on <paramref name="date"/> (fallback to previous business day).</summary>
    [HttpGet("rates")]
    public async Task<IActionResult> GetRate([FromQuery] string code, [FromQuery] DateOnly date, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code)) return BadRequest(new { error = "code required" });
        code = code.ToUpperInvariant();
        if (code == "UAH") return Ok(new RateDto("UAH", date, 1m));
        var rate = await _nbu.GetRateAsync(code, date, ct);
        if (rate is null) return NotFound(new { error = "no rate for given currency" });
        // Look up the actual row date (could be earlier than requested).
        var row = await _db.ExchangeRates
            .Where(r => r.Code == code && r.Date <= date)
            .OrderByDescending(r => r.Date)
            .Select(r => new RateDto(r.Code, r.Date, r.RateToUah))
            .FirstOrDefaultAsync(ct);
        return Ok(row);
    }

    /// <summary>Current user's display preferences (creates defaults if missing).</summary>
    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var row = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        return Ok(new PreferencesDto(row?.PreferredCurrency ?? "UAH"));
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesRequest req, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var code = (req.PreferredCurrency ?? string.Empty).ToUpperInvariant();
        if (!AllowedCodes.Contains(code))
            return BadRequest(new { error = "PreferredCurrency must be one of UAH, USD, EUR" });

        var existing = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (existing is null)
        {
            _db.UserPreferences.Add(new UserPreferences
            {
                UserId = userId,
                PreferredCurrency = code,
                UpdatedAtUtc = DateTime.UtcNow,
            });
        }
        else
        {
            existing.PreferredCurrency = code;
            existing.UpdatedAtUtc = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
        return Ok(new PreferencesDto(code));
    }
}
