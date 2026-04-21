using System.Text.Json;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO.Converters;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;

public class UpdateFieldGeometryHandler : IRequestHandler<UpdateFieldGeometryCommand>
{
    private readonly IAppDbContext _context;

    public UpdateFieldGeometryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateFieldGeometryCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .FirstOrDefaultAsync(f => f.Id == request.FieldId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Fields.Field), request.FieldId);

        var options = new JsonSerializerOptions();
        options.Converters.Add(new GeoJsonConverterFactory());

        // Leaflet's toGeoJSON() produces a FeatureCollection; extract the first feature's geometry
        var geometryJson = ExtractGeometryJson(request.GeoJson);

        var geometry = JsonSerializer.Deserialize<Geometry>(geometryJson, options)
            ?? throw new ArgumentException("Invalid GeoJSON geometry.");

        geometry.SRID = 4326;
        field.Geometry = geometry;
        field.GeoJson = request.GeoJson;

        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// If the input is a GeoJSON FeatureCollection, returns the raw JSON of the first feature's
    /// geometry so it can be deserialized as an NTS <see cref="Geometry"/>.
    /// Plain geometry objects (Polygon, MultiPolygon, …) are returned unchanged.
    /// </summary>
    private static string ExtractGeometryJson(string geoJson)
    {
        using var doc = JsonDocument.Parse(geoJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("type", out var typeElement) &&
            typeElement.GetString() == "FeatureCollection")
        {
            if (!root.TryGetProperty("features", out var features) ||
                features.GetArrayLength() == 0)
                throw new ArgumentException("FeatureCollection must contain at least one feature.");

            var firstFeature = features[0];
            if (firstFeature.TryGetProperty("geometry", out var geometryElement))
                return geometryElement.GetRawText();

            throw new ArgumentException("FeatureCollection contains no geometry in its first feature.");
        }

        return geoJson;
    }
}
