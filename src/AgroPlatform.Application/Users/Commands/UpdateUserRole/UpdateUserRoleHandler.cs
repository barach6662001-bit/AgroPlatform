using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
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
        if (!Enum.TryParse<UserRole>(request.Role, out var newRole) || newRole == UserRole.SuperAdmin)
            throw new ValidationException(new[] { new ValidationFailure("Role", $"Invalid role: {request.Role}") });

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        // Ensure the user belongs to the same tenant
        if (user.TenantId != _currentUser.TenantId)
            throw new ForbiddenException("Cannot modify users from another tenant.");

        if (user.Role == UserRole.SuperAdmin)
            throw new ForbiddenException("Cannot change the role of a SuperAdmin account.");

        user.Role = newRole;
        await _userManager.UpdateAsync(user);
    }
}
