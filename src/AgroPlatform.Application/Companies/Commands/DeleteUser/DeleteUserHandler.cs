using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Companies.Commands.DeleteUser;

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public DeleteUserHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can delete users.");

        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        if (user.Role == UserRole.SuperAdmin)
            throw new ForbiddenException("Cannot delete a SuperAdmin account.");

        if (request.UserId == _currentUser.UserId)
            throw new ForbiddenException("Cannot delete your own account.");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new ApplicationException(
                $"Failed to delete user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
}
