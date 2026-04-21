using AgroPlatform.Domain.Users;

namespace AgroPlatform.Application.Common.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(AppUser user);
    string GenerateRefreshToken();
    string HashToken(string token);
    int RefreshTokenExpiresInDays { get; }
}
