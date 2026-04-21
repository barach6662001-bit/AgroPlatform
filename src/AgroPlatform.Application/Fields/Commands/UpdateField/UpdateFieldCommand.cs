using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateField;

public record UpdateFieldCommand(
    Guid Id,
    string Name,
    string? CadastralNumber,
    decimal AreaHectares,
    CropType? CurrentCrop,
    int? CurrentCropYear,
    string? GeoJson,
    string? SoilType,
    string? Notes,
    int OwnershipType = 0
) : IRequest;
