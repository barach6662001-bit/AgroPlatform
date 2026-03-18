using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Retrieves Ukrainian cadastral parcel data by scraping kadastrova-karta.com.
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
    /// Returns cadastral parcel data for a Ukrainian land parcel by its cadastral number.
    /// Scrapes kadastrova-karta.com and returns parsed metadata (area, ownership, purpose, address).
    /// </summary>
    /// <param name="cadnum">Cadastral number (e.g. 1822087200:01:000:0576).</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest(new { message = "cadnum is required" });

        var normalizedCadnum = cadnum.Trim();

        // Validate cadastral number format: digits and colons only (e.g. 1822087200:01:000:0576)
        if (!System.Text.RegularExpressions.Regex.IsMatch(normalizedCadnum, @"^[\d:]+$"))
            return BadRequest(new { message = "cadnum contains invalid characters" });

        var url = $"https://kadastrova-karta.com/dilyanka/{normalizedCadnum}";

        try
        {
            var http = _httpClientFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(15);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.TryAddWithoutValidation("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            request.Headers.TryAddWithoutValidation("Accept",
                "text/html,application/xhtml+xml");

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
            _logger.LogWarning("Cadastre request failed for {Cadnum}: {Error}", cadnum, ex.Message);
            return Ok(new { found = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cadastre scraping error for {Cadnum}", cadnum);
            return Ok(new { found = false, error = "Scraping error" });
        }
    }
}
