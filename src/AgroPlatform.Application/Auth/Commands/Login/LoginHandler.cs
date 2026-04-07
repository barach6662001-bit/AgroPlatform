using AgroPlatform.Application.Auth.DTOs;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Auth.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAppDbContext _db;

    public LoginHandler(UserManager<AppUser> userManager, IJwtTokenService jwtTokenService, IAppDbContext db)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _db = db;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedException("Account is inactive.");

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
            user.RequirePasswordChange,
            user.HasCompletedOnboarding,
            user.FirstName,
            user.LastName,
            refreshTokenValue,
            refreshTokenExpiresAt);
    }
}
