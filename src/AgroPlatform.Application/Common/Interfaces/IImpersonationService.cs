namespace AgroPlatform.Application.Common.Interfaces;

/// <summary>
/// Super-admin impersonation engine.
/// All operations require an authenticated super-admin caller (enforced at the
/// controller layer via <c>[SuperAdminRequired]</c>).
/// </summary>
public interface IImpersonationService
{
    /// <summary>
    /// Validates the rate limit (3 sessions per 24h per (admin, target) pair),
    /// audits <c>impersonate.start</c>, persists an in-app <c>warning</c> notification
    /// for the target user, best-effort emails the target, and returns a 60-minute
    /// impersonation JWT. Reason must be at least 10 characters.
    /// </summary>
    /// <exception cref="ArgumentException">When <paramref name="reason"/> is shorter than 10 characters.</exception>
    /// <exception cref="KeyNotFoundException">When <paramref name="targetUserId"/> does not exist.</exception>
    /// <exception cref="InvalidOperationException">
    /// When the rate limit is exceeded or when the caller attempts to impersonate themselves
    /// or another super-admin.
    /// </exception>
    Task<ImpersonationResult> StartAsync(string targetUserId, string reason, CancellationToken cancellationToken = default);

    /// <summary>
    /// Ends the active impersonation session: writes <c>impersonate.end</c> audit and
    /// returns a fresh super-admin token for the original admin so the SPA can swap back.
    /// Caller token must carry <c>impersonated_by_user_id</c>.
    /// </summary>
    Task<ImpersonationEndResult> EndAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Records a forbidden-action attempt during impersonation. Returns silently —
    /// callers wrap in their own 403 response. Idempotent best-effort logging.
    /// </summary>
    Task LogForbiddenAttemptAsync(string attemptedRoute, CancellationToken cancellationToken = default);
}

public sealed record ImpersonationResult(
    string Token,
    DateTime ExpiresAtUtc,
    string TargetUserId,
    string TargetEmail,
    string TargetFirstName,
    string TargetLastName,
    Guid TargetTenantId,
    string TargetTenantName);

public sealed record ImpersonationEndResult(string Token, DateTime ExpiresAtUtc);
