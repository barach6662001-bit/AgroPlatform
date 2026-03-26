using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.UpdateGrainStorage;

public record UpdateGrainStorageCommand(
    Guid Id,
    string Name,
    string? Code,
    string? Location,
    string? StorageType,
    decimal? CapacityTons,
    bool IsActive,
    string? Notes
) : IRequest;
