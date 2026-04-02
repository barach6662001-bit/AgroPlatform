using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Companies.Commands.ResetUserPassword;

public class ResetUserPasswordHandler : IRequestHandler<ResetUserPasswordCommand>
{
    private readonly UserManager<AppUser> _userManager;

    public ResetUserPasswordHandler(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task Handle(ResetUserPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException("User", request.UserId);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .Select(e => new ValidationFailure("NewPassword", e.Description))
                .ToList();
            throw new ValidationException(errors);
        }

        user.RequirePasswordChange = true;
        await _userManager.UpdateAsync(user);
    }
}
