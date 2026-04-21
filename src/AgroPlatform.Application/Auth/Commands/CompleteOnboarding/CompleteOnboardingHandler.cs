using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Auth.Commands.CompleteOnboarding;

public class CompleteOnboardingHandler : IRequestHandler<CompleteOnboardingCommand>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public CompleteOnboardingHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteOnboardingCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new UnauthorizedException("Not authenticated.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new UnauthorizedException("User not found.");

        user.HasCompletedOnboarding = true;
        await _userManager.UpdateAsync(user);
    }
}
