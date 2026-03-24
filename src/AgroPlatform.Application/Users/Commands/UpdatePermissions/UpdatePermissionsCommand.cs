using MediatR;

namespace AgroPlatform.Application.Users.Commands.UpdatePermissions;

public record UpdatePermissionDto(
    Guid PermissionId,
    bool CanRead,
    bool CanCreate,
    bool CanUpdate,
    bool CanDelete,
    string? Notes
);

public record UpdatePermissionsCommand(
    Guid RoleId,
    List<UpdatePermissionDto> Permissions
) : IRequest<Unit>;
