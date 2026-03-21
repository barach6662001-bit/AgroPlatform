using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;

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
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public SatelliteController(
        IAppDbContext db,
        ILogger<SatelliteController> logger,
        ICurrentUserService currentUser,
        INotificationService notificationService)
    {
        _db = db;
        _logger = logger;
        _instanceId = Environment.GetEnvironmentVariable("SENTINEL_HUB_INSTANCE_ID") ?? "";
        _currentUser = currentUser;
        _notificationService = notificationService;
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

    /// <summary>
    /// Returns an ordered list of available NDVI snapshot dates for a field.
    /// When real Sentinel Hub date discovery is not configured, returns a synthetic
    /// fallback list of recent dates so the frontend slider works out of the box.
    /// </summary>
    [HttpGet("dates/{fieldId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDates(Guid fieldId, CancellationToken ct)
    {
        var fieldExists = await _db.Fields
            .Where(f => f.Id == fieldId)
            .AnyAsync(ct);

        if (!fieldExists)
            return NotFound(new { error = "Field not found" });

        // Generate synthetic recent dates in 10-day steps (Sentinel-2 revisit cadence)
        // When a real catalog API is integrated, replace this with actual acquisition dates.
        var today = DateTime.UtcNow.Date;
        var dates = Enumerable.Range(0, 6)
            .Select(i => today.AddDays(-i * 10).ToString("yyyy-MM-dd"))
            .Reverse()
            .ToArray();

        return Ok(dates);
    }

    public sealed record DetectNdviProblemRequest(string Date, double StressedPercent, string Message);

    /// <summary>
    /// Called by the frontend when canvas analysis detects a stressed NDVI zone.
    /// Creates a notification for the current tenant.
    /// </summary>
    [HttpPost("ndvi/{fieldId:guid}/detect-problem")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DetectProblem(
        Guid fieldId,
        [FromBody] DetectNdviProblemRequest request,
        CancellationToken ct)
    {
        var field = await _db.Fields
            .Where(f => f.Id == fieldId)
            .Select(f => new { f.Name })
            .FirstOrDefaultAsync(ct);

        if (field == null)
            return NotFound(new { error = "Field not found" });

        var body = $"Поле: {field.Name}. {request.Message}";
        await _notificationService.SendAsync(
            _currentUser.TenantId,
            "warning",
            "Проблемна NDVI-зона",
            body,
            ct);

        return NoContent();
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

    /// <summary>
    /// Generates a prescription map by combining NDVI data and soil analysis records.
    /// Returns application rate recommendations per zone.
    /// </summary>
    [HttpGet("prescription/{fieldId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPrescription(Guid fieldId, CancellationToken ct)
    {
        var field = await _db.Fields
            .Where(f => f.Id == fieldId)
            .Select(f => new { f.Id, f.Name, f.AreaHectares })
            .FirstOrDefaultAsync(ct);

        if (field == null)
            return NotFound(new { error = "Field not found" });

        var analyses = await _db.SoilAnalyses
            .Where(s => s.FieldId == fieldId)
            .OrderByDescending(s => s.SampleDate)
            .ToListAsync(ct);

        var ndviConfigured = !string.IsNullOrEmpty(_instanceId);

        var zones = analyses.Select(a => BuildPrescriptionZone(a)).ToList();

        if (zones.Count == 0)
        {
            zones.Add(new PrescriptionZoneDto
            {
                ZoneId = "Z1",
                SampleDate = null,
                Ph = null,
                N = null,
                P = null,
                K = null,
                Humus = null,
                Notes = "No soil analysis data available",
                RecommendedNKgPerHa = 80,
                RecommendedPKgPerHa = 60,
                RecommendedKKgPerHa = 80,
                ApplicationZone = "Medium",
            });
        }

        return Ok(new
        {
            fieldId,
            fieldName = field.Name,
            areaHectares = field.AreaHectares,
            ndviConfigured,
            generatedAt = DateTime.UtcNow,
            zones,
        });
    }

    /// <summary>
    /// Exports the prescription map as CSV for use in precision agriculture equipment.
    /// </summary>
    [HttpGet("prescription/{fieldId:guid}/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportPrescriptionCsv(Guid fieldId, CancellationToken ct)
    {
        var field = await _db.Fields
            .Where(f => f.Id == fieldId)
            .Select(f => new { f.Id, f.Name, f.AreaHectares })
            .FirstOrDefaultAsync(ct);

        if (field == null)
            return NotFound(new { error = "Field not found" });

        var analyses = await _db.SoilAnalyses
            .Where(s => s.FieldId == fieldId)
            .OrderByDescending(s => s.SampleDate)
            .ToListAsync(ct);

        var zones = analyses.Count > 0
            ? analyses.Select(a => BuildPrescriptionZone(a)).ToList()
            : new List<PrescriptionZoneDto>
            {
                new PrescriptionZoneDto
                {
                    ZoneId = "Z1",
                    SampleDate = null,
                    Ph = null,
                    N = null,
                    P = null,
                    K = null,
                    Humus = null,
                    Notes = "No soil analysis data",
                    RecommendedNKgPerHa = 80,
                    RecommendedPKgPerHa = 60,
                    RecommendedKKgPerHa = 80,
                    ApplicationZone = "Medium",
                }
            };

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("ZoneId,SampleDate,pH,N_mg_kg,P_mg_kg,K_mg_kg,Humus_%,N_Rate_kg_ha,P_Rate_kg_ha,K_Rate_kg_ha,Zone,Notes");
        foreach (var z in zones)
        {
            sb.AppendLine(
                $"{Escape(z.ZoneId)}," +
                $"{(z.SampleDate.HasValue ? z.SampleDate.Value.ToString("yyyy-MM-dd") : "")}," +
                $"{FormatDecimal(z.Ph)}," +
                $"{FormatDecimal(z.N)}," +
                $"{FormatDecimal(z.P)}," +
                $"{FormatDecimal(z.K)}," +
                $"{FormatDecimal(z.Humus)}," +
                $"{z.RecommendedNKgPerHa}," +
                $"{z.RecommendedPKgPerHa}," +
                $"{z.RecommendedKKgPerHa}," +
                $"{Escape(z.ApplicationZone)}," +
                $"{Escape(z.Notes ?? "")}"
            );
        }

        var fileName = $"prescription_{field.Name.Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMdd}.csv";
        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", fileName);
    }

    private static string Escape(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }

    private static string FormatDecimal(decimal? value)
        => value.HasValue ? value.Value.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture) : "";

    private static PrescriptionZoneDto BuildPrescriptionZone(SoilAnalysis a)
    {
        var nRate = CalcNutrientRate(a.N, lowThreshold: 30, highThreshold: 80, lowRate: 100, medRate: 60, highRate: 30);
        var pRate = CalcNutrientRate(a.P, lowThreshold: 20, highThreshold: 60, lowRate: 80, medRate: 50, highRate: 20);
        var kRate = CalcNutrientRate(a.K, lowThreshold: 80, highThreshold: 160, lowRate: 100, medRate: 60, highRate: 30);

        var avgRate = (nRate + pRate + kRate) / 3.0m;
        var zone = avgRate >= 80 ? "High" : avgRate >= 50 ? "Medium" : "Low";

        return new PrescriptionZoneDto
        {
            ZoneId = a.ZoneId ?? a.Id.ToString()[..8],
            SampleDate = a.SampleDate,
            Ph = a.Ph,
            N = a.N,
            P = a.P,
            K = a.K,
            Humus = a.Humus,
            Notes = a.Notes,
            RecommendedNKgPerHa = nRate,
            RecommendedPKgPerHa = pRate,
            RecommendedKKgPerHa = kRate,
            ApplicationZone = zone,
        };
    }

    /// <summary>
    /// Calculates the recommended fertiliser application rate based on measured soil nutrient level.
    /// </summary>
    /// <param name="value">Measured soil nutrient concentration (mg/kg). Null triggers the medium rate.</param>
    /// <param name="lowThreshold">Below this value the soil is considered deficient → <paramref name="lowRate"/> applies.</param>
    /// <param name="highThreshold">Above this value the soil is considered sufficient → <paramref name="highRate"/> applies.</param>
    /// <param name="lowRate">Rate (kg/ha) for deficient soils.</param>
    /// <param name="medRate">Rate (kg/ha) for moderate soils.</param>
    /// <param name="highRate">Rate (kg/ha) for well-supplied soils.</param>
    /// <returns>Recommended application rate in kg/ha.</returns>
    private static decimal CalcNutrientRate(
        decimal? value,
        decimal lowThreshold, decimal highThreshold,
        decimal lowRate, decimal medRate, decimal highRate)
    {
        if (!value.HasValue) return medRate;
        if (value < lowThreshold) return lowRate;
        if (value <= highThreshold) return medRate;
        return highRate;
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

public sealed class PrescriptionZoneDto
{
    public string ZoneId { get; set; } = string.Empty;
    public DateTime? SampleDate { get; set; }
    public decimal? Ph { get; set; }
    public decimal? N { get; set; }
    public decimal? P { get; set; }
    public decimal? K { get; set; }
    public decimal? Humus { get; set; }
    public string? Notes { get; set; }
    public decimal RecommendedNKgPerHa { get; set; }
    public decimal RecommendedPKgPerHa { get; set; }
    public decimal RecommendedKKgPerHa { get; set; }
    public string ApplicationZone { get; set; } = "Medium";
}
