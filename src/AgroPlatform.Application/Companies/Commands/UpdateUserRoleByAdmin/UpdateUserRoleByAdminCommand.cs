using MediatR;

namespace AgroPlatform.Application.Companies.Commands.UpdateUserRoleByAdmin;

/// <summary>Changes a user's role — SuperAdmin only. Cannot assign SuperAdmin role.</summary>
public record UpdateUserRoleByAdminCommand(string UserId, string Role) : IRequest;
