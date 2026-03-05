using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.PlanRotation;

public record PlanRotationCommand(
    Guid FieldId,
    int Year,
    CropType PlannedCrop,
    string? Notes
) : IRequest<Guid>;
