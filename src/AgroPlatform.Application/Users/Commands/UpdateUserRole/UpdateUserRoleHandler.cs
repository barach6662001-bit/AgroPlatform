using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Users.Commands.UpdateUserRole;

public class UpdateUserRoleHandler : IRequestHandler<UpdateUserRoleCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserRoleHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<UserRole>(request.Role, out var newRole))
            throw new ValidationException($"Invalid role: {request.Role}");

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        // Ensure the user belongs to the same tenant
        if (user.TenantId != _currentUser.TenantId)
            throw new ForbiddenException("Cannot modify users from another tenant.");

        user.Role = newRole;
        await _userManager.UpdateAsync(user);
    }
}
