using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainStorage;

public record CreateGrainStorageCommand(
    string Name,
    string? Code,
    string? Location,
    string? StorageType,
    decimal? CapacityTons,
    bool IsActive,
    string? Notes
) : IRequest<Guid>;
