using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateFieldZone;

public record UpdateFieldZoneCommand(
    Guid Id,
    string Name,
    string? GeoJson,
    string? SoilType,
    string? Notes
) : IRequest;
