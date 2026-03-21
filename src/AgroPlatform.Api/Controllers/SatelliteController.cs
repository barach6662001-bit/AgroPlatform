using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgroPlatform.Application.Common.Interfaces;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/satellite")]
[Produces("application/json")]
public class SatelliteController : ControllerBase
{
    private readonly IAppDbContext _db;
    private readonly ILogger<SatelliteController> _logger;
    private readonly string _instanceId;

    public SatelliteController(IAppDbContext db, ILogger<SatelliteController> logger)
    {
        _db = db;
        _logger = logger;
        _instanceId = Environment.GetEnvironmentVariable("SENTINEL_HUB_INSTANCE_ID") ?? "";
    }

    /// <summary>
    /// Returns NDVI satellite imagery info for a field.
    /// Acts as a proxy/abstraction for Sentinel Hub WMS.
    /// When SENTINEL_HUB_INSTANCE_ID is not configured, returns a placeholder so the frontend does not crash.
    /// </summary>
    [HttpGet("ndvi/{fieldId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNdvi(
        Guid fieldId,
        [FromQuery] string? date,
        CancellationToken ct)
    {
        var field = await _db.Fields
            .Where(f => f.Id == fieldId)
            .Select(f => new { f.Id, f.GeoJson })
            .FirstOrDefaultAsync(ct);

        if (field == null)
            return NotFound(new { error = "Field not found" });

        // Parse bounds from GeoJSON to determine the image extent
        double[]? bounds = null;
        if (!string.IsNullOrEmpty(field.GeoJson))
        {
            try
            {
                bounds = ExtractBoundsFromGeoJson(field.GeoJson);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to parse GeoJSON for field {FieldId}: {Error}", fieldId, ex.Message);
            }
        }

        var effectiveDate = string.IsNullOrWhiteSpace(date)
            ? DateTime.UtcNow.ToString("yyyy-MM-dd")
            : date;

        // Validate date format to prevent injection into external URLs
        if (!System.Text.RegularExpressions.Regex.IsMatch(effectiveDate, @"^\d{4}-\d{2}-\d{2}$") ||
            !DateTime.TryParseExact(effectiveDate, "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out _))
        {
            return BadRequest(new { error = "Invalid date format. Expected yyyy-MM-dd." });
        }

        string imageUrl;

        if (!string.IsNullOrEmpty(_instanceId) && bounds != null)
        {
            // Real Sentinel Hub WMS endpoint
            var bbox = $"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}";
            imageUrl = $"https://services.sentinel-hub.com/ogc/wms/{_instanceId}" +
                       $"?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap" +
                       $"&LAYERS=NDVI&STYLES=&CRS=EPSG:4326" +
                       $"&BBOX={bbox}&WIDTH=512&HEIGHT=512" +
                       $"&TIME={effectiveDate}/{effectiveDate}" +
                       $"&FORMAT=image/png&TRANSPARENT=true";
        }
        else
        {
            // Placeholder: a static NDVI-style demo image (no secrets exposed)
            imageUrl = $"/api/satellite/ndvi-placeholder";
        }

        return Ok(new
        {
            fieldId,
            date = effectiveDate,
            imageUrl,
            bounds,
            configured = !string.IsNullOrEmpty(_instanceId)
        });
    }

    /// <summary>Returns a simple SVG placeholder image that resembles an NDVI colour ramp.</summary>
    [HttpGet("ndvi-placeholder")]
    [AllowAnonymous]
    public IActionResult GetPlaceholder()
    {
        var svg = """
            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
              <defs>
                <linearGradient id="ndvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="#2d6a4f"/>
                  <stop offset="40%"  stop-color="#52b788"/>
                  <stop offset="70%"  stop-color="#d9ed92"/>
                  <stop offset="100%" stop-color="#e63946"/>
                </linearGradient>
              </defs>
              <rect width="256" height="256" fill="url(#ndvi)" opacity="0.65"/>
              <text x="128" y="128" text-anchor="middle" dominant-baseline="middle"
                    font-family="sans-serif" font-size="13" fill="#fff" opacity="0.9">
                NDVI placeholder
              </text>
            </svg>
            """;
        return Content(svg, "image/svg+xml");
    }

    // ---------------------------------------------------------------------------
    // Helper: extract [minLon, minLat, maxLon, maxLat] from a GeoJSON string
    // ---------------------------------------------------------------------------
    private static double[] ExtractBoundsFromGeoJson(string geoJson)
    {
        // Quick extraction using System.Text.Json – supports Feature, FeatureCollection,
        // Polygon, MultiPolygon.
        var doc = System.Text.Json.JsonDocument.Parse(geoJson);
        var coords = new List<(double lon, double lat)>();
        CollectCoordinates(doc.RootElement, coords);

        if (coords.Count == 0)
            throw new InvalidOperationException("No coordinates found");

        double minLon = coords.Min(c => c.lon);
        double minLat = coords.Min(c => c.lat);
        double maxLon = coords.Max(c => c.lon);
        double maxLat = coords.Max(c => c.lat);

        return [minLon, minLat, maxLon, maxLat];
    }

    private static void CollectCoordinates(
        System.Text.Json.JsonElement el,
        List<(double lon, double lat)> result)
    {
        switch (el.ValueKind)
        {
            case System.Text.Json.JsonValueKind.Object:
                if (el.TryGetProperty("coordinates", out var coords))
                    CollectCoordinates(coords, result);
                else if (el.TryGetProperty("geometry", out var geom))
                    CollectCoordinates(geom, result);
                else if (el.TryGetProperty("features", out var features))
                    CollectCoordinates(features, result);
                break;

            case System.Text.Json.JsonValueKind.Array:
                // Check if this array is a coordinate pair [lon, lat, ...]
                if (el.GetArrayLength() >= 2 &&
                    el[0].ValueKind == System.Text.Json.JsonValueKind.Number &&
                    el[1].ValueKind == System.Text.Json.JsonValueKind.Number)
                {
                    result.Add((el[0].GetDouble(), el[1].GetDouble()));
                }
                else
                {
                    foreach (var item in el.EnumerateArray())
                        CollectCoordinates(item, result);
                }
                break;
        }
    }
}
