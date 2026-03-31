using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Companies.Commands.UpdateUserRoleByAdmin;

public class UpdateUserRoleByAdminHandler : IRequestHandler<UpdateUserRoleByAdminCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserRoleByAdminHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateUserRoleByAdminCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can change user roles.");

        if (!Enum.TryParse<UserRole>(request.Role, out var newRole) || newRole == UserRole.SuperAdmin)
            throw new ValidationException(new[] { new ValidationFailure("Role", "Invalid role. SuperAdmin cannot be assigned.") });

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        if (user.Role == UserRole.SuperAdmin)
            throw new ForbiddenException("Cannot change the role of a SuperAdmin account.");

        user.Role = newRole;
        await _userManager.UpdateAsync(user);
    }
}
