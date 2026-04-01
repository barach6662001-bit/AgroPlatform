using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using AgroPlatform.Domain.Users;

namespace AgroPlatform.Application.Companies.Commands.DeactivateUser;

public class DeactivateUserHandler : IRequestHandler<DeactivateUserCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public DeactivateUserHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can deactivate users.");

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        if (user.Role == UserRole.SuperAdmin)
            throw new ForbiddenException("Cannot deactivate a SuperAdmin account.");

        if (request.UserId == _currentUser.UserId)
            throw new ForbiddenException("Cannot deactivate your own account.");

        user.IsActive = false;
        await _userManager.UpdateAsync(user);
    }
}
