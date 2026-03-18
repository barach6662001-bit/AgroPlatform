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

    /// <summary>Proxy to kadastrova-karta.com tile API</summary>
    [HttpGet("tile/{z}/{x}/{y}")]
    public async Task<IActionResult> GetTile(int z, int x, int y, CancellationToken ct)
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

            var bytes = await response.Content.ReadAsByteArrayAsync(ct);
            return File(bytes, "application/x-protobuf");
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
