using AgroPlatform.Application.Auth.DTOs;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Auth.Commands.RefreshToken;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAppDbContext _db;

    public RefreshTokenHandler(
        UserManager<AppUser> userManager,
        IJwtTokenService jwtTokenService,
        IAppDbContext db)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _db = db;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _jwtTokenService.HashToken(request.RefreshToken);

        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (storedToken == null || !storedToken.IsActive)
            throw new UnauthorizedException("Invalid or expired refresh token.");

        var user = await _userManager.FindByIdAsync(storedToken.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedException("User not found or inactive.");

        // Revoke old token
        storedToken.RevokedAtUtc = DateTime.UtcNow;

        // Generate new tokens
        var (accessToken, expiresAt) = _jwtTokenService.GenerateToken(user);
        var newRefreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var newRefreshTokenHash = _jwtTokenService.HashToken(newRefreshTokenValue);
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtTokenService.RefreshTokenExpiresInDays);

        storedToken.ReplacedByTokenHash = newRefreshTokenHash;

        var newRefreshToken = new Domain.Users.RefreshToken
        {
            UserId = user.Id,
            TokenHash = newRefreshTokenHash,
            ExpiresAtUtc = refreshTokenExpiresAt,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken,
            user.Email!,
            user.Role.ToString(),
            expiresAt,
            user.TenantId,
            user.RequirePasswordChange,
            user.HasCompletedOnboarding,
            user.FirstName,
            user.LastName,
            newRefreshTokenValue,
            refreshTokenExpiresAt);
    }
}
