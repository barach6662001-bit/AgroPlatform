using AgroPlatform.Domain.Users;

namespace AgroPlatform.Application.Common.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(AppUser user);

    /// <summary>
    /// Generates a short-lived intermediate token that carries <c>scope=mfa_pending</c>.
    /// The token is accepted only by the MFA verification endpoint; every other
    /// authenticated endpoint treats it as unauthenticated / unverified.
    /// </summary>
    (string Token, DateTime ExpiresAt) GenerateMfaPendingToken(AppUser user);

    string GenerateRefreshToken();
    string HashToken(string token);
    int RefreshTokenExpiresInDays { get; }
}
