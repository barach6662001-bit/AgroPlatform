using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Companies.Commands.ActivateUser;

public class ActivateUserHandler : IRequestHandler<ActivateUserCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public ActivateUserHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(ActivateUserCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can activate users.");

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        user.IsActive = true;
        await _userManager.UpdateAsync(user);
    }
}
