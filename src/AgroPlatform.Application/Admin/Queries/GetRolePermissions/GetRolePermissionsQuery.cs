using MediatR;

namespace AgroPlatform.Application.Admin.Queries.GetRolePermissions;

public record GetRolePermissionsQuery : IRequest<List<RolePermissionDto>>;

public record RolePermissionDto(string RoleName, string PolicyName, bool IsGranted);
