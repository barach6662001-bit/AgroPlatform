using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldZone;

public record CreateFieldZoneCommand(
    Guid FieldId,
    string Name,
    string? GeoJson,
    string? SoilType,
    string? Notes
) : IRequest<Guid>;
