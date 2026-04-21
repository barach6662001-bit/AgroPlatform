using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;

/// <summary>Updates the PostGIS geometry polygon of a field.</summary>
public record UpdateFieldGeometryCommand(Guid FieldId, string GeoJson) : IRequest;
