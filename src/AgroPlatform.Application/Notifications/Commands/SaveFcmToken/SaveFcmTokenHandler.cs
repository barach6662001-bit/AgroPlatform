using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Notifications.Commands.SaveFcmToken;

public class SaveFcmTokenHandler : IRequestHandler<SaveFcmTokenCommand>
{
    private readonly ICurrentUserService _currentUser;
    private readonly UserManager<AppUser> _userManager;

    public SaveFcmTokenHandler(ICurrentUserService currentUser, UserManager<AppUser> userManager)
    {
        _currentUser = currentUser;
        _userManager = userManager;
    }

    public async Task Handle(SaveFcmTokenCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId)) return;

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return;

        user.FcmToken = request.Token;
        await _userManager.UpdateAsync(user);
    }
}
