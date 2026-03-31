using MediatR;

namespace AgroPlatform.Application.Admin.Commands.UpdateRolePermissions;

public record UpdateRolePermissionsCommand(List<RolePermissionItem> Items) : IRequest;

public record RolePermissionItem(string RoleName, string PolicyName, bool IsGranted);
