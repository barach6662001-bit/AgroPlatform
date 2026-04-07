using AgroPlatform.Application.Auth.DTOs;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Auth.Commands.ChangePassword;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, AuthResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _db;

    public ChangePasswordHandler(
        UserManager<AppUser> userManager,
        IJwtTokenService jwtTokenService,
        ICurrentUserService currentUser,
        IAppDbContext db)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _currentUser = currentUser;
        _db = db;
    }

    public async Task<AuthResponse> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new UnauthorizedException("Not authenticated.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new UnauthorizedException("User not found.");

        if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
            throw new UnauthorizedException("Current password is incorrect.");

        var changeResult = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!changeResult.Succeeded)
        {
            var errors = changeResult.Errors
                .Select(e => new ValidationFailure("NewPassword", e.Description))
                .ToList();
            throw new ValidationException(errors);
        }

        user.RequirePasswordChange = false;
        await _userManager.UpdateAsync(user);

        var (token, expiresAt) = _jwtTokenService.GenerateToken(user);

        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtTokenService.RefreshTokenExpiresInDays);

        var refreshToken = new Domain.Users.RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashToken(refreshTokenValue),
            ExpiresAtUtc = refreshTokenExpiresAt,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            token,
            user.Email!,
            user.Role.ToString(),
            expiresAt,
            user.TenantId,
            false,
            user.HasCompletedOnboarding,
            user.FirstName,
            user.LastName,
            refreshTokenValue,
            refreshTokenExpiresAt);
    }
}
