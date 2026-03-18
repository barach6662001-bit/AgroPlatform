using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Proxies requests to the Ukrainian cadastre API to avoid browser CORS restrictions.
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
    /// Returns GeoJSON for a Ukrainian cadastral parcel by its cadastral number.
    /// Tries kadastr.live first, falls back to map.land.gov.ua.
    /// </summary>
    /// <param name="cadnum">Cadastral number (e.g. 1810400000:00:022:0005).</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest(new { message = "cadnum is required" });

        var encodedCadnum = Uri.EscapeDataString(cadnum);
        using var http = _httpClientFactory.CreateClient();

        // Primary source: kadastr.live (WFS 2.0.0)
        var primaryUrl =
            $"https://kadastr.live/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature" +
            $"&typeNames=kadastr:cadaster_parcel&outputFormat=application/json" +
            $"&CQL_FILTER=cadnum='{encodedCadnum}'&srsName=EPSG:4326";

        try
        {
            var body = await http.GetStringAsync(primaryUrl, ct);
            return Content(body, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Primary cadastre source (kadastr.live) failed for cadnum={Cadnum}. Trying fallback.", cadnum);
        }

        // Fallback: public cadastre map (WFS 1.0.0)
        var fallbackUrl =
            $"https://map.land.gov.ua/geowebcache/service/wfs?service=WFS&version=1.0.0&request=GetFeature" +
            $"&typeName=kadastr:cadaster_parcel&outputFormat=application/json" +
            $"&CQL_FILTER=cadnum='{encodedCadnum}'";

        try
        {
            var body = await http.GetStringAsync(fallbackUrl, ct);
            return Content(body, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status502BadGateway,
                new { message = "Failed to retrieve cadastral data from all sources", detail = ex.Message });
        }
    }
}
