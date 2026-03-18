using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Proxies requests to Ukrainian cadastre APIs to avoid browser CORS restrictions.
/// </summary>
[ApiController]
[Authorize]
[Route("api/cadastre")]
[Produces("application/json")]
public class CadastreController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CadastreController> _logger;

    /// <summary>Initializes a new instance of <see cref="CadastreController"/>.</summary>
    public CadastreController(IHttpClientFactory httpClientFactory, ILogger<CadastreController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Returns parcel data for a Ukrainian cadastral number.
    /// Tries kadastr.live (WFS), then map.land.gov.ua (WFS), then kadastrova-karta.com (Vector Tiles).
    /// Returns a unified JSON object: <c>{ found, cadnum, geometry, area, properties }</c>.
    /// </summary>
    /// <param name="cadnum">Cadastral number (e.g. 1822087200:01:000:0576).</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (compatible; AgroTech/1.0)");
        http.DefaultRequestHeaders.Add("Referer", "https://kadastrova-karta.com.ua/");

        var url = $"https://kadastrova-karta.com/tiles/maps/kadastr/{z}/{x}/{y}.pbf";

        try
        {
            var response = await http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode);

            var response = await http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();
            var html = await response.Content.ReadAsStringAsync(ct);

            if (string.IsNullOrEmpty(html))
                return Ok(new { found = false, error = "Empty response" });

            // Parse area (площа)
            var areaMatch = Regex.Match(html,
                @"Площа[:\s]*<[^>]+>\s*([\d.,]+)\s*га",
                RegexOptions.IgnoreCase);

            // Parse ownership form (форма власності)
            var ownershipMatch = Regex.Match(html,
                @"Форма власності[:\s]*<[^>]+>\s*([^<]+)",
                RegexOptions.IgnoreCase);

            // Parse intended purpose (цільове призначення)
            var purposeMatch = Regex.Match(html,
                @"Цільове призначення[:\s]*<[^>]+>\s*([^<]+)",
                RegexOptions.IgnoreCase);

            // Parse address (адреса)
            var addressMatch = Regex.Match(html,
                @"Адреса[:\s]*<[^>]+>\s*([^<]+)",
                RegexOptions.IgnoreCase);

            var result = new
            {
                found = true,
                cadnum = normalizedCadnum,
                area = areaMatch.Success
                    ? areaMatch.Groups[1].Value.Trim().Replace(",", ".")
                    : (string?)null,
                ownership = ownershipMatch.Success
                    ? ownershipMatch.Groups[1].Value.Trim()
                    : (string?)null,
                purpose = purposeMatch.Success
                    ? purposeMatch.Groups[1].Value.Trim()
                    : (string?)null,
                address = addressMatch.Success
                    ? addressMatch.Groups[1].Value.Trim()
                    : (string?)null,
                sourceUrl = url
            };

            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            var body = await http.GetStringAsync(fallbackUrl, ct);
            var result = ParseWfsResponse(body, cadnum);
            if (result is not null)
                return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fallback WFS cadastre source failed for cadnum={Cadnum}", cadnum);
        }

        // Source 3: kadastrova-karta.com (Mapbox Vector Tiles)
        try
        {
            http.DefaultRequestHeaders.TryAddWithoutValidation("Referer", "https://kadastrova-karta.com/");
            var result = await SearchVectorTilesAsync(http, cadnum, ct);
            if (result is not null)
                return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Tile fetch failed {Url}: {Error}", url, ex.Message);
            return StatusCode(503);
        }
    }

    /// <summary>Search parcel by cadnum via kadastrova-karta.com page scraping</summary>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest("cadnum is required");

        var normalizedCadnum = cadnum.Trim();
        var http = _httpClientFactory.CreateClient();
        http.Timeout = TimeSpan.FromSeconds(15);
        http.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        var url = $"https://kadastrova-karta.com/dilyanka/{normalizedCadnum}";

        try
        {
            var html = await http.GetStringAsync(url, ct);

            if (string.IsNullOrEmpty(html))
                return Ok(new { found = false });

            // Парсимо площу з HTML
            var areaMatch = System.Text.RegularExpressions.Regex.Match(
                html, @"Площа[:\s]*[\d\s]*<[^>]+>\s*([\d.,]+)\s*га",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            // Другий варіант пошуку площі
            if (!areaMatch.Success)
            {
                areaMatch = System.Text.RegularExpressions.Regex.Match(
                    html, @"([\d.,]+)\s*га",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            }

            var result = new
            {
                found = html.Contains(normalizedCadnum),
                cadnum = normalizedCadnum,
                area = areaMatch.Success ? areaMatch.Groups[1].Value.Trim().Replace(",", ".") : null,
                sourceUrl = url
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Cadastre scraping failed for {Cadnum}: {Error}", cadnum, ex.Message);
            return Ok(new { found = false, error = ex.Message });
        }
    }
}
