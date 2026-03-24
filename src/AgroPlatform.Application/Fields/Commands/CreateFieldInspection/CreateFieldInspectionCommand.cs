using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldInspection;

public record CreateFieldInspectionCommand(
    Guid FieldId,
    DateTime Date,
    string InspectorName,
    string? Notes,
    string? Severity,
    double? Latitude,
    double? Longitude,
    string? PhotoUrl
) : IRequest<Guid>;
