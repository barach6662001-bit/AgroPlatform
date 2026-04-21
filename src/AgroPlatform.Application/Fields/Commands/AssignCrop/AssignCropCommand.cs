using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.AssignCrop;

public record AssignCropCommand(
    Guid FieldId,
    CropType Crop,
    int Year,
    decimal? YieldPerHectare,
    string? Notes
) : IRequest<Guid>;
