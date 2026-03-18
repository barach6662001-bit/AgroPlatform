using System.Text.Json;
using Mapbox.VectorTile;
using Mapbox.VectorTile.ExtensionMethods;
using Mapbox.VectorTile.Geometry;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Proxies requests to Ukrainian cadastre APIs to avoid browser CORS restrictions.
/// Tries WFS sources first, then falls back to Vector Tiles (kadastrova-karta.com).
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
    /// <param name="cadnum">Cadastral number (e.g. 1810400000:00:022:0005).</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("parcel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetParcel([FromQuery] string cadnum, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cadnum))
            return BadRequest(new { message = "cadnum is required" });

        var encodedCadnum = Uri.EscapeDataString(cadnum);
        using var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (compatible; AgroTech/1.0)");

        // Source 1: kadastr.live (WFS 2.0.0)
        var primaryUrl =
            $"https://kadastr.live/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature" +
            $"&typeNames=kadastr:cadaster_parcel&outputFormat=application/json" +
            $"&CQL_FILTER=cadnum='{encodedCadnum}'&srsName=EPSG:4326";

        try
        {
            var body = await http.GetStringAsync(primaryUrl, ct);
            var result = ParseWfsResponse(body, cadnum);
            if (result is not null)
                return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Primary cadastre source (kadastr.live) failed for cadnum={Cadnum}", cadnum);
        }

        // Source 2: map.land.gov.ua (WFS 1.0.0)
        var fallbackUrl =
            $"https://map.land.gov.ua/geowebcache/service/wfs?service=WFS&version=1.0.0&request=GetFeature" +
            $"&typeName=kadastr:cadaster_parcel&outputFormat=application/json" +
            $"&CQL_FILTER=cadnum='{encodedCadnum}'";

        try
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
            _logger.LogWarning(ex, "Vector Tiles cadastre source failed for cadnum={Cadnum}", cadnum);
        }

        return Ok(new { found = false, cadnum });
    }

    // -------------------------------------------------------------------------
    // WFS parsing
    // -------------------------------------------------------------------------

    private static object? ParseWfsResponse(string body, string cadnum)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (!root.TryGetProperty("features", out var features) || features.GetArrayLength() == 0)
                return null;

            var feature = features[0];
            if (!feature.TryGetProperty("geometry", out var geomEl) || geomEl.ValueKind == JsonValueKind.Null)
                return null;

            var geometry = geomEl.Clone();

            double? area = null;
            if (feature.TryGetProperty("properties", out var propsEl) && propsEl.ValueKind == JsonValueKind.Object)
            {
                foreach (var key in new[] { "area", "Area", "AREA", "calc_area" })
                {
                    if (propsEl.TryGetProperty(key, out var areaEl) && areaEl.TryGetDouble(out var val))
                    {
                        area = val;
                        break;
                    }
                }
            }

            return new { found = true, cadnum, geometry, area };
        }
        catch
        {
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Vector Tiles search
    // -------------------------------------------------------------------------

    private async Task<object?> SearchVectorTilesAsync(HttpClient http, string cadnum, CancellationToken ct)
    {
        var clean = cadnum.Replace(":", "").Replace(" ", "");
        if (clean.Length < 2)
            return null;

        var regionCode = clean[..2];
        var (minLat, maxLat, minLng, maxLng) = GetRegionBbox(regionCode);

        const int zoom = 14;
        var (xMin, yMin) = LatLngToTile(maxLat, minLng, zoom);
        var (xMax, yMax) = LatLngToTile(minLat, maxLng, zoom);

        if (xMin > xMax) (xMin, xMax) = (xMax, xMin);
        if (yMin > yMax) (yMin, yMax) = (yMax, yMin);

        const int maxTiles = 50;
        var tilesChecked = 0;

        for (var tx = xMin; tx <= xMax && tilesChecked < maxTiles; tx++)
        {
            for (var ty = yMin; ty <= yMax && tilesChecked < maxTiles; ty++)
            {
                tilesChecked++;
                try
                {
                    var url = $"https://kadastrova-karta.com/tiles/maps/kadastr/{zoom}/{tx}/{ty}.pbf";
                    var bytes = await http.GetByteArrayAsync(url, ct);
                    var result = ParsePbfForCadnum(bytes, cadnum, zoom, tx, ty);
                    if (result is not null)
                        return result;
                }
                catch (Exception ex)
                {
                    _logger.LogDebug("Tile {Zoom}/{Tx}/{Ty} failed: {Error}", zoom, tx, ty, ex.Message);
                }
            }
        }

        return null;
    }

    private object? ParsePbfForCadnum(byte[] pbfBytes, string cadnum, int zoom, int tileX, int tileY)
    {
        try
        {
            var tile = new Mapbox.VectorTile.VectorTile(pbfBytes, validate: false);

            foreach (var layerName in tile.LayerNames())
            {
                var layer = tile.GetLayer(layerName);

                for (var i = 0; i < layer.FeatureCount(); i++)
                {
                    var feature = layer.GetFeature(i, clipBuffer: null, scale: 1.0f);
                    var props = feature.GetProperties();

                    var matches =
                        (props.TryGetValue("cadnum", out var cn) && cn?.ToString() == cadnum) ||
                        (props.TryGetValue("cadnumber", out var cn2) && cn2?.ToString() == cadnum);

                    if (!matches)
                        continue;

                    var wgs84 = feature.GeometryAsWgs84(
                        (ulong)zoom, (ulong)tileX, (ulong)tileY, clipBuffer: null);

                    var geometry = BuildGeoJsonGeometry(feature.GeometryType, wgs84);

                    double? area = null;
                    foreach (var key in new[] { "area", "Area", "AREA" })
                    {
                        if (props.TryGetValue(key, out var aVal) && aVal is not null
                            && double.TryParse(aVal.ToString(), System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture, out var d))
                        {
                            area = d;
                            break;
                        }
                    }

                    return new { found = true, cadnum, geometry, area, properties = props };
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug("PBF parse error for tile {Z}/{X}/{Y}: {Error}", zoom, tileX, tileY, ex.Message);
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Geometry helpers
    // -------------------------------------------------------------------------

    private static object BuildGeoJsonGeometry(GeomType geomType, List<List<LatLng>> rings)
    {
        if (rings.Count == 0)
            return new { type = "Polygon", coordinates = Array.Empty<double[][]>() };

        var allCoords = rings
            .Select(ring => ring.Select(pt => new[] { pt.Lng, pt.Lat }).ToArray())
            .ToArray();

        if (geomType != GeomType.POLYGON)
            return new { type = "Polygon", coordinates = allCoords };

        // Detect multiple exterior rings for MultiPolygon support
        var exteriorIndices = new List<int>();
        for (var i = 0; i < rings.Count; i++)
        {
            if (IsExteriorRing(rings[i]))
                exteriorIndices.Add(i);
        }

        if (exteriorIndices.Count <= 1)
            return new { type = "Polygon", coordinates = allCoords };

        // MultiPolygon: each exterior ring starts a new polygon, followed by its holes
        var polygons = new List<double[][][]>(exteriorIndices.Count);
        for (var k = 0; k < exteriorIndices.Count; k++)
        {
            var start = exteriorIndices[k];
            var end = k + 1 < exteriorIndices.Count ? exteriorIndices[k + 1] : rings.Count;
            polygons.Add(allCoords[start..end]);
        }

        return new { type = "MultiPolygon", coordinates = polygons.ToArray() };
    }

    /// <summary>
    /// Returns true when the ring is wound counter-clockwise (exterior ring in GeoJSON convention).
    /// Uses the shoelace formula on WGS-84 coordinates.
    /// </summary>
    private static bool IsExteriorRing(List<LatLng> ring)
    {
        var n = ring.Count;
        var area = 0.0;
        for (var i = 0; i < n; i++)
        {
            var j = (i + 1) % n;
            area += ring[i].Lng * ring[j].Lat;
            area -= ring[j].Lng * ring[i].Lat;
        }
        return area > 0; // positive = CCW = exterior
    }

    // -------------------------------------------------------------------------
    // Tile coordinate utilities
    // -------------------------------------------------------------------------

    private static (int x, int y) LatLngToTile(double lat, double lng, int zoom)
    {
        var n = Math.Pow(2, zoom);
        var x = (int)((lng + 180.0) / 360.0 * n);
        var latRad = lat * Math.PI / 180.0;
        var y = (int)((1.0 - Math.Log(Math.Tan(latRad) + 1.0 / Math.Cos(latRad)) / Math.PI) / 2.0 * n);
        return (x, y);
    }

    /// <summary>Returns approximate bounding box (minLat, maxLat, minLng, maxLng) for a Ukrainian region code.</summary>
    private static (double minLat, double maxLat, double minLng, double maxLng) GetRegionBbox(string regionCode) =>
        regionCode switch
        {
            "01" => (44.4, 45.5, 33.3, 36.6),   // АРК
            "05" => (47.7, 49.2, 27.3, 30.5),   // Вінницька
            "07" => (50.5, 52.4, 23.5, 25.8),   // Волинська
            "12" => (47.5, 49.3, 33.2, 36.8),   // Дніпропетровська
            "14" => (48.0, 49.4, 37.2, 39.8),   // Донецька
            "18" => (46.0, 47.8, 32.2, 35.5),   // Херсонська (КОАТУУ 18)
            "21" => (47.6, 49.8, 29.4, 33.2),   // Закарпатська (КОАТУУ 21)
            "23" => (47.8, 49.5, 31.8, 36.5),   // Кіровоградська
            "26" => (49.2, 51.8, 29.2, 33.0),   // Київська
            "30" => (50.2, 51.0, 30.2, 30.8),   // Київ (місто)
            "32" => (49.7, 51.4, 32.7, 36.2),   // Полтавська (КОАТУУ 32)
            "35" => (49.2, 51.8, 23.3, 27.2),   // Рівненська
            "44" => (49.3, 50.6, 38.0, 40.2),   // Луганська
            "46" => (48.5, 49.3, 22.1, 24.6),   // Закарпатська (КОАТУУ 46)
            "48" => (46.4, 48.2, 29.5, 32.8),   // Миколаївська
            "51" => (46.2, 48.0, 30.4, 33.5),   // Одеська
            "53" => (49.2, 50.6, 31.5, 35.6),   // Полтавська (КОАТУУ 53)
            "56" => (50.8, 52.3, 32.5, 35.3),   // Сумська
            "59" => (49.3, 50.6, 35.1, 37.6),   // Сумська (КОАТУУ 59)
            "61" => (47.1, 48.4, 35.0, 37.6),   // Запорізька
            "63" => (47.4, 49.6, 35.4, 39.4),   // Харківська
            "65" => (46.7, 47.8, 32.6, 36.2),   // Херсонська (КОАТУУ 65)
            "68" => (48.8, 50.5, 25.3, 27.8),   // Хмельницька
            "71" => (49.2, 51.0, 27.4, 30.5),   // Черкаська
            "73" => (48.1, 49.8, 24.0, 26.5),   // Чернівецька
            "74" => (51.1, 52.4, 31.1, 34.0),   // Чернігівська
            "80" => (49.5, 50.1, 30.1, 30.8),   // Київ (місто, КОАТУУ 80)
            _   => (44.0, 52.4, 22.0, 40.2),    // Вся Україна (fallback)
        };
}
