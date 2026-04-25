using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AgroPlatform.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _jwtSettings;

    public JwtTokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("TenantId", user.TenantId.ToString()),
            new Claim("first_name", user.FirstName ?? string.Empty),
            new Claim("last_name", user.LastName ?? string.Empty),
            new Claim("is_super_admin", user.IsSuperAdmin ? "true" : "false"),
            new Claim("mfa_verified", "true"),
        };

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public (string Token, DateTime ExpiresAt) GenerateMfaPendingToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Deliberately lean: the MFA-pending token is only accepted by /api/auth/mfa/verify,
        // which looks it up by Sub. No Role, TenantId, or is_super_admin until verification.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("scope", "mfa_pending"),
        };

        var expiresAt = DateTime.UtcNow.AddMinutes(5);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public (string Token, DateTime ExpiresAt) GenerateImpersonationToken(
        AppUser target,
        string impersonatedByUserId,
        Guid originalTenantId,
        string reason)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Identity = target user (so tenant filter, role-based authorization, and
        // foreign-key audit trails point at the correct user). is_super_admin is
        // intentionally "false" so the impersonator cannot reach /api/admin while
        // impersonating — they must call /api/admin/impersonate/end first.
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, target.Id),
            new Claim(JwtRegisteredClaimNames.Email, target.Email ?? string.Empty),
            new Claim(ClaimTypes.Name, target.UserName ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, target.Id),
            new Claim(ClaimTypes.Role, target.Role.ToString()),
            new Claim("TenantId", target.TenantId.ToString()),
            new Claim("first_name", target.FirstName ?? string.Empty),
            new Claim("last_name", target.LastName ?? string.Empty),
            new Claim("is_super_admin", "false"),
            new Claim("mfa_verified", "true"),
            new Claim("impersonated_by_user_id", impersonatedByUserId),
            new Claim("original_tenant_id", originalTenantId.ToString()),
            new Claim("impersonation_reason", reason),
        };

        // Locked: 60 minutes, not renewable. Impersonator must start a new session
        // after expiry — refresh-token flow does not apply to impersonation tokens.
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    public int RefreshTokenExpiresInDays => _jwtSettings.RefreshTokenExpiresInDays;
}
