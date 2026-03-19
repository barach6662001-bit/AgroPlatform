using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/cadastre")]
public class CadastreController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CadastreController> _logger;

    public CadastreController(IHttpClientFactory httpClientFactory, ILogger<CadastreController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>Proxy vector tile from kadastrova-karta.com</summary>
    [HttpGet("tile/{z}/{x}/{y}")]
    public async Task<IActionResult> GetTile(int z, int x, int y, CancellationToken ct)
    {
        var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (compatible; AgroTech/1.0)");
        http.DefaultRequestHeaders.TryAddWithoutValidation("Referer", "https://kadastrova-karta.com.ua/");

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

    /// <summary>Get parcel info by cadnum via kadastrova-karta.com</summary>
    [HttpGet("parcel")]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest("cadnum is required");

        var normalizedCadnum = cadnum.Trim();
        var http = _httpClientFactory.CreateClient();
        http.Timeout = TimeSpan.FromSeconds(15);
        http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        var url = $"https://kadastrova-karta.com/dilyanka/{normalizedCadnum}";

        try
        {
            var html = await http.GetStringAsync(url, ct);

            if (string.IsNullOrEmpty(html))
                return Ok(new { found = false });

            var areaMatch = Regex.Match(html,
                @"([\d]+[.,][\d]+)\s*га",
                RegexOptions.IgnoreCase);

            var result = new
            {
                found = html.Contains(normalizedCadnum),
                cadnum = normalizedCadnum,
                area = areaMatch.Success
                    ? areaMatch.Groups[1].Value.Trim().Replace(",", ".")
                    : (string?)null,
                sourceUrl = url
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Cadastre failed for {Cadnum}: {Error}", cadnum, ex.Message);
            return Ok(new { found = false, error = ex.Message });
        }
    }
}
