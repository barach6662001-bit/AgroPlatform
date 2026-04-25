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

    /// <summary>
    /// Generates a 60-minute impersonation token that takes the identity of the
    /// <paramref name="target"/> user (Sub, TenantId, Role) but additionally carries
    /// <c>impersonated_by_user_id</c>, <c>original_tenant_id</c>, and <c>impersonation_reason</c>
    /// claims so the server can audit, restrict forbidden actions, and the SPA can
    /// render the persistent red banner. <c>is_super_admin</c> is intentionally <c>false</c>
    /// in the issued token to prevent escalation while impersonating.
    /// </summary>
    (string Token, DateTime ExpiresAt) GenerateImpersonationToken(
        AppUser target,
        string impersonatedByUserId,
        Guid originalTenantId,
        string reason);

    string GenerateRefreshToken();
    string HashToken(string token);
    int RefreshTokenExpiresInDays { get; }
}
