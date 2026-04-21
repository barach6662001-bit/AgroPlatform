using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using AgroPlatform.Application.Common.Interfaces;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/cadastre")]
public class CadastreController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CadastreController> _logger;
    private readonly IAppDbContext _db;

    public CadastreController(
        IHttpClientFactory httpClientFactory,
        ILogger<CadastreController> logger,
        IAppDbContext db)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _db = db;
    }

    /// <summary>
    /// Отримати інформацію про ділянку за кадастровим номером.
    /// Спочатку перевіряє кеш в БД, потім звертається до kadastrova-karta.com.
    /// </summary>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest(new { error = "cadnum is required" });

        var normalized = cadnum.Trim();

        // Валідація формату: XXXXXXXXXX:XX:XXX:XXXX
        if (!Regex.IsMatch(normalized, @"^\d{10}:\d{2}:\d{3}:\d{4}$"))
            return BadRequest(new { error = "Invalid cadastral number format. Expected: XXXXXXXXXX:XX:XXX:XXXX" });

        // 1. Перевірити кеш — чи є поле з таким кадастровим номером і свіжими даними
        var cachedField = await _db.Fields
            .Where(f => f.CadastralNumber == normalized && f.CadastralFetchedAt != null)
            .Select(f => new
            {
                f.CadastralNumber,
                f.CadastralArea,
                f.CadastralPurpose,
                f.CadastralOwnership,
                f.CadastralFetchedAt
            })
            .FirstOrDefaultAsync(ct);

        if (cachedField != null)
        {
            return Ok(new
            {
                found = true,
                cadnum = cachedField.CadastralNumber,
                area = cachedField.CadastralArea?.ToString("0.####"),
                purpose = cachedField.CadastralPurpose,
                ownership = cachedField.CadastralOwnership,
                cached = true,
                fetchedAt = cachedField.CadastralFetchedAt
            });
        }

        // 2. Запит до kadastrova-karta.com
        var http = _httpClientFactory.CreateClient();
        http.Timeout = TimeSpan.FromSeconds(15);
        http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        var url = $"https://kadastrova-karta.com/dilyanka/{normalized}";

        try
        {
            var html = await http.GetStringAsync(url, ct);

            if (string.IsNullOrEmpty(html) || !html.Contains(normalized))
                return Ok(new { found = false, cadnum = normalized });

            // Парсимо площу
            var areaMatch = Regex.Match(html, @"Площа[^<]*?</[^>]+>\s*<[^>]+>\s*([\d]+[.,][\d]+)\s*га", RegexOptions.IgnoreCase);
            if (!areaMatch.Success)
            {
                _logger.LogDebug("Specific area pattern failed for {Cadnum}, trying fallback", normalized);
                areaMatch = Regex.Match(html, @"([\d]+[.,][\d]+)\s*га", RegexOptions.IgnoreCase);
            }

            // Парсимо цільове призначення
            var purposeMatch = Regex.Match(html, @"Цільове призначення[^<]*?</[^>]+>\s*<[^>]+>\s*([^<]+)", RegexOptions.IgnoreCase);

            // Парсимо форму власності
            var ownershipMatch = Regex.Match(html, @"Форма власності[^<]*?</[^>]+>\s*<[^>]+>\s*([^<]+)", RegexOptions.IgnoreCase);

            var result = new
            {
                found = true,
                cadnum = normalized,
                area = areaMatch.Success
                    ? areaMatch.Groups[1].Value.Trim().Replace(",", ".")
                    : (string?)null,
                purpose = purposeMatch.Success
                    ? purposeMatch.Groups[1].Value.Trim()
                    : (string?)null,
                ownership = ownershipMatch.Success
                    ? ownershipMatch.Groups[1].Value.Trim()
                    : (string?)null,
                cached = false,
                sourceUrl = url
            };

            return Ok(result);
        }
        catch (TaskCanceledException)
        {
            return Ok(new { found = false, cadnum = normalized, error = "Request timeout" });
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Cadastre fetch failed for {Cadnum}: {Error}", normalized, ex.Message);
            return Ok(new { found = false, cadnum = normalized, error = ex.Message });
        }
    }

    /// <summary>
    /// Зберегти кадастрові дані для поля (кешування).
    /// Викликається з фронтенду після підтвердження юзером.
    /// </summary>
    [HttpPost("cache/{fieldId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CacheParcelData(
        Guid fieldId,
        [FromBody] CacheParcelRequest request,
        CancellationToken ct)
    {
        var field = await _db.Fields.FindAsync(new object[] { fieldId }, ct);
        if (field == null)
            return NotFound();

        field.CadastralNumber = request.CadastralNumber;
        field.CadastralArea = request.Area;
        field.CadastralPurpose = request.Purpose;
        field.CadastralOwnership = request.Ownership;
        field.CadastralFetchedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }

    /// <summary>Proxy vector tile (PBF) from kadastrova-karta.com for map display</summary>
    [HttpGet("tile/{z:int}/{x:int}/{y:int}")]
    public async Task<IActionResult> GetTile(int z, int x, int y, CancellationToken ct)
    {
        var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (compatible; AgroTech/1.0)");
        http.DefaultRequestHeaders.TryAddWithoutValidation("Referer", "https://kadastrova-karta.com/");

        var url = $"https://kadastrova-karta.com/tiles/maps/kadastr/{z}/{x}/{y}.pbf";

        try
        {
            var response = await http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode);

            var bytes = await response.Content.ReadAsByteArrayAsync(ct);
            return File(bytes, "application/x-protobuf");
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Tile fetch failed {Url}: {Error}", url, ex.Message);
            return StatusCode(503);
        }
    }
}

public record CacheParcelRequest(
    string CadastralNumber,
    decimal? Area,
    string? Purpose,
    string? Ownership
);
