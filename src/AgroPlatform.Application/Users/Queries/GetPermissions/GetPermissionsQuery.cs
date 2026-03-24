using MediatR;

namespace AgroPlatform.Application.Users.Queries.GetPermissions;

public record GetPermissionsQuery(Guid RoleId) : IRequest<List<PermissionDto>>;

public record PermissionDto(
    Guid Id,
    string Module,
    bool CanRead,
    bool CanCreate,
    bool CanUpdate,
    bool CanDelete,
    DateTime? LastReviewedAtUtc,
    string? Notes
);
