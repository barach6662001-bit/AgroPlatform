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

        var geometry = JsonSerializer.Deserialize<Geometry>(request.GeoJson, options)
            ?? throw new ArgumentException("Invalid GeoJSON geometry.");

        geometry.SRID = 4326;
        field.Geometry = geometry;
        field.GeoJson = request.GeoJson;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
