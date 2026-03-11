using MediatR;

namespace AgroPlatform.Application.Users.Commands.UpdateUserRole;

public record UpdateUserRoleCommand(string UserId, string Role) : IRequest;
