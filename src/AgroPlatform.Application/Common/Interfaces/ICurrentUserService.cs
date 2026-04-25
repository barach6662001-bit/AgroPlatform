using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
    Guid TenantId { get; }
    UserRole? Role { get; }
    bool IsInRole(UserRole role);
    bool IsSuperAdmin { get; }
    bool MfaVerified { get; }

    /// <summary>
    /// True when the current request is executing under a super-admin
    /// impersonation token (PR #614). When true, <see cref="UserId"/> reflects the
    /// impersonated target user, while <see cref="ImpersonatedByUserId"/> identifies
    /// the super-admin acting on their behalf.
    /// </summary>
    bool IsImpersonating { get; }

    /// <summary>Super-admin who initiated the active impersonation, or null.</summary>
    string? ImpersonatedByUserId { get; }
}
