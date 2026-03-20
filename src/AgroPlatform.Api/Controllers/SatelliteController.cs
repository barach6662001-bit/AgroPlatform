using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Provides satellite imagery proxied from Sentinel Hub WMS.
/// </summary>
[ApiController]
[Authorize]
[Route("api/satellite")]
[Produces("application/json")]
public class SatelliteController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SatelliteController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IAppDbContext _db;

    /// <summary>Initializes a new instance of <see cref="SatelliteController"/>.</summary>
    public SatelliteController(
        IHttpClientFactory httpClientFactory,
        ILogger<SatelliteController> logger,
        IConfiguration configuration,
        IAppDbContext db)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _configuration = configuration;
        _db = db;
    }

    /// <summary>
    /// Returns a Sentinel-2 NDVI image for a given field, proxied from Sentinel Hub WMS.
    /// </summary>
    /// <param name="fieldId">The field identifier.</param>
    /// <param name="date">The image date in yyyy-MM-dd format. Defaults to today.</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("ndvi/{fieldId:guid}")]
    [Produces("image/png", "application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetNdvi(
        Guid fieldId,
        [FromQuery] string? date,
        CancellationToken ct)
    {
        var instanceId = _configuration["SentinelHub:InstanceId"];
        if (string.IsNullOrWhiteSpace(instanceId))
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Sentinel Hub is not configured. Set SentinelHub:InstanceId in configuration." });
        }

        // Validate and sanitise the date parameter to prevent URL injection
        string requestDate;
        if (string.IsNullOrWhiteSpace(date))
        {
            requestDate = DateTime.UtcNow.ToString("yyyy-MM-dd");
        }
        else if (DateTime.TryParseExact(date.Trim(), "yyyy-MM-dd",
                     System.Globalization.CultureInfo.InvariantCulture,
                     System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            requestDate = parsedDate.ToString("yyyy-MM-dd");
        }
        else
        {
            return BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd." });
        }

        var field = await _db.Fields
            .AsNoTracking()
            .Where(f => f.Id == fieldId)
            .Select(f => new { f.GeoJson })
            .FirstOrDefaultAsync(ct);

        if (field == null)
            return NotFound(new { error = "Field not found." });

        if (string.IsNullOrWhiteSpace(field.GeoJson))
            return BadRequest(new { error = "Field has no geometry. Draw the field boundary on the map first." });

        BoundingBox? bbox;
        try
        {
            bbox = ComputeBoundingBox(field.GeoJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to parse GeoJSON for field {FieldId}: {Error}", fieldId, ex.Message);
            return BadRequest(new { error = "Could not parse field geometry." });
        }

        if (bbox == null)
            return BadRequest(new { error = "Could not compute bounding box from field geometry." });

        var wmsUrl = BuildWmsUrl(instanceId, bbox, requestDate);

        var http = _httpClientFactory.CreateClient();
        http.Timeout = TimeSpan.FromSeconds(30);

        try
        {
            var response = await http.GetAsync(wmsUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Sentinel Hub WMS returned {Status} for field {FieldId}", response.StatusCode, fieldId);
                return StatusCode((int)response.StatusCode, new { error = "Sentinel Hub request failed." });
            }

            var bytes = await response.Content.ReadAsByteArrayAsync(ct);
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/png";
            return File(bytes, contentType);
        }
        catch (TaskCanceledException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Request to Sentinel Hub timed out." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching NDVI from Sentinel Hub for field {FieldId}", fieldId);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Failed to fetch satellite imagery." });
        }
    }

    private static string BuildWmsUrl(string instanceId, BoundingBox bbox, string date)
    {
        var invariantCulture = System.Globalization.CultureInfo.InvariantCulture;
        var bboxParam = string.Join(",",
            bbox.MinLon.ToString("F6", invariantCulture),
            bbox.MinLat.ToString("F6", invariantCulture),
            bbox.MaxLon.ToString("F6", invariantCulture),
            bbox.MaxLat.ToString("F6", invariantCulture));

        return $"https://services.sentinel-hub.com/ogc/wms/{instanceId}" +
               $"?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap" +
               $"&LAYERS=NDVI" +
               $"&BBOX={bboxParam}" +
               $"&WIDTH=512&HEIGHT=512" +
               $"&CRS=EPSG:4326" +
               $"&TIME={date}/{date}" +
               $"&FORMAT=image/png";
    }

    private static BoundingBox? ComputeBoundingBox(string geoJson)
    {
        using var doc = JsonDocument.Parse(geoJson);
        var coordinates = ExtractCoordinates(doc.RootElement);
        if (coordinates.Count == 0)
            return null;

        double minLon = double.MaxValue, minLat = double.MaxValue;
        double maxLon = double.MinValue, maxLat = double.MinValue;

        foreach (var (lon, lat) in coordinates)
        {
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
        }

        // Add a small buffer (~100 m) so the field is not cut off at the edges
        const double buffer = 0.001;
        return new BoundingBox(minLon - buffer, minLat - buffer, maxLon + buffer, maxLat + buffer);
    }

    private static List<(double Lon, double Lat)> ExtractCoordinates(JsonElement element)
    {
        var result = new List<(double, double)>();

        var type = element.TryGetProperty("type", out var typeProp)
            ? typeProp.GetString() ?? ""
            : "";

        switch (type)
        {
            case "FeatureCollection":
                if (element.TryGetProperty("features", out var features))
                    foreach (var feature in features.EnumerateArray())
                        result.AddRange(ExtractCoordinates(feature));
                break;

            case "Feature":
                if (element.TryGetProperty("geometry", out var geometry))
                    result.AddRange(ExtractCoordinates(geometry));
                break;

            case "Polygon":
                if (element.TryGetProperty("coordinates", out var polyCoords))
                    result.AddRange(ExtractPolygonCoords(polyCoords));
                break;

            case "MultiPolygon":
                if (element.TryGetProperty("coordinates", out var multiCoords))
                    foreach (var poly in multiCoords.EnumerateArray())
                        result.AddRange(ExtractPolygonCoords(poly));
                break;
        }

        return result;
    }

    private static IEnumerable<(double Lon, double Lat)> ExtractPolygonCoords(JsonElement coordsElement)
    {
        foreach (var ring in coordsElement.EnumerateArray())
            foreach (var point in ring.EnumerateArray())
            {
                var arr = point.EnumerateArray().ToList();
                if (arr.Count >= 2)
                    yield return (arr[0].GetDouble(), arr[1].GetDouble());
            }
    }
}

/// <summary>Represents a geographic bounding box in WGS84 coordinates.</summary>
public record BoundingBox(double MinLon, double MinLat, double MaxLon, double MaxLat);
