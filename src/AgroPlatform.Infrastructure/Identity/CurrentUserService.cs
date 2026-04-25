using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace AgroPlatform.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
        ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

    public Guid TenantId
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Items.TryGetValue("TenantId", out var tenantIdObj) == true
                && tenantIdObj is Guid tenantId)
            {
                return tenantId;
            }

            var claim = context?.User?.FindFirstValue("TenantId");
            if (Guid.TryParse(claim, out var tenantIdFromClaim))
                return tenantIdFromClaim;

            return Guid.Empty;
        }
    }

    public UserRole? Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (Enum.TryParse<UserRole>(roleClaim, out var role))
                return role;
            return null;
        }
    }

    public bool IsInRole(UserRole role) => Role == role;

    /// <summary>
    /// Platform-level super-admin. Either <see cref="UserRole.SuperAdmin"/> (legacy)
    /// or the new <c>is_super_admin</c> JWT claim (additive flag on <c>AppUser</c>).
    /// </summary>
    public bool IsSuperAdmin
    {
        get
        {
            if (Role == UserRole.SuperAdmin) return true;
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("is_super_admin");
            return string.Equals(claim, "true", StringComparison.OrdinalIgnoreCase);
        }
    }

    /// <summary>
    /// True when the current token represents a fully MFA-verified session. Tokens
    /// issued with <c>scope=mfa_pending</c> set this to false; everything else is treated as verified
    /// (legacy tokens without the claim predate MFA and default to true for backwards compatibility).
    /// </summary>
    public bool MfaVerified
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null || !(user.Identity?.IsAuthenticated ?? false)) return false;

            var scope = user.FindFirstValue("scope");
            if (string.Equals(scope, "mfa_pending", StringComparison.OrdinalIgnoreCase))
                return false;

            var verified = user.FindFirstValue("mfa_verified");
            if (verified is null) return true;
            return string.Equals(verified, "true", StringComparison.OrdinalIgnoreCase);
        }
    }

    /// <summary>
    /// True when the current token carries the <c>impersonated_by_user_id</c> claim.
    /// </summary>
    public bool IsImpersonating
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("impersonated_by_user_id");
            return !string.IsNullOrWhiteSpace(claim);
        }
    }

    public string? ImpersonatedByUserId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("impersonated_by_user_id");
            return string.IsNullOrWhiteSpace(claim) ? null : claim;
        }
    }
}
