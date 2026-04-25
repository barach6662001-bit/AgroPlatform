using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services;

/// <summary>
/// Super-admin impersonation engine (PR #614).
/// </summary>
public sealed class ImpersonationService : IImpersonationService
{
    public const string ActionStart = "impersonate.start";
    public const string ActionEnd = "impersonate.end";
    public const string ActionForbiddenAttempt = "impersonate.forbidden_attempt";

    /// <summary>Locked: 3 sessions per (admin, target) per 24h.</summary>
    private const int RateLimitPerWindow = 3;
    private static readonly TimeSpan RateLimitWindow = TimeSpan.FromHours(24);
    private const int MinReasonLength = 10;

    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IJwtTokenService _jwt;
    private readonly ISuperAdminAuditService _audit;
    private readonly IEmailService _email;
    private readonly UserManager<AppUser> _userManager;
    private readonly IHttpContextAccessor _http;
    private readonly ILogger<ImpersonationService> _logger;

    public ImpersonationService(
        IAppDbContext db,
        ICurrentUserService currentUser,
        IJwtTokenService jwt,
        ISuperAdminAuditService audit,
        IEmailService email,
        UserManager<AppUser> userManager,
        IHttpContextAccessor http,
        ILogger<ImpersonationService> logger)
    {
        _db = db;
        _currentUser = currentUser;
        _jwt = jwt;
        _audit = audit;
        _email = email;
        _userManager = userManager;
        _http = http;
        _logger = logger;
    }

    public async Task<ImpersonationResult> StartAsync(string targetUserId, string reason, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < MinReasonLength)
            throw new ArgumentException($"Reason must be at least {MinReasonLength} characters.", nameof(reason));

        var adminId = _currentUser.UserId
            ?? throw new InvalidOperationException("No authenticated super-admin in context.");

        if (string.Equals(adminId, targetUserId, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Super-admin cannot impersonate themselves.");

        var target = await _db.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == targetUserId, cancellationToken)
            ?? throw new KeyNotFoundException($"User {targetUserId} not found.");

        if (target.IsSuperAdmin)
            throw new InvalidOperationException("Super-admin accounts cannot be impersonated.");

        if (!target.IsActive)
            throw new InvalidOperationException("Inactive users cannot be impersonated.");

        // Rate limit: count successful 'impersonate.start' entries by THIS admin
        // for THIS target in the last 24h. Backed by partial composite index.
        var since = DateTime.UtcNow - RateLimitWindow;
        var recentCount = await _db.SuperAdminAuditLogs
            .AsNoTracking()
            .Where(l =>
                l.Action == ActionStart &&
                l.AdminUserId == adminId &&
                l.TargetType == "User" &&
                l.TargetId == targetUserId &&
                l.OccurredAt >= since)
            .CountAsync(cancellationToken);

        if (recentCount >= RateLimitPerWindow)
            throw new InvalidOperationException(
                $"Rate limit exceeded: {RateLimitPerWindow} impersonation sessions per 24h per (admin, target).");

        // Resolve admin (for full_name in notification body) and tenant name.
        var admin = await _userManager.FindByIdAsync(adminId)
            ?? throw new InvalidOperationException("Super-admin record not found.");
        var originalTenantId = _currentUser.TenantId;

        var tenantName = await _db.Tenants
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(t => t.Id == target.TenantId)
            .Select(t => t.Name)
            .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

        // Audit FIRST so the row exists before the token is handed out.
        await _audit.LogAsync(
            ActionStart,
            targetType: "User",
            targetId: targetUserId,
            before: null,
            after: new { reason, target_tenant_id = target.TenantId, target_email = target.Email },
            cancellationToken);

        // In-app notification (independent of SMTP availability).
        var kyivNow = ConvertToKyiv(DateTime.UtcNow);
        var adminFullName = string.Join(' ', new[] { admin.FirstName, admin.LastName }
            .Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
        if (string.IsNullOrWhiteSpace(adminFullName)) adminFullName = admin.Email ?? adminId;

        _db.Notifications.Add(new Notification
        {
            TenantId = target.TenantId,
            Type = "warning",
            Title = "Сесія імперсонації",
            Body = $"Адміністратор {adminFullName} увійшов під вашим акаунтом {kyivNow:dd.MM.yyyy HH:mm} (Київ). Причина: {reason.Trim()}.",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync(cancellationToken);

        // Best-effort email; if SMTP is not configured, IEmailService logs and returns.
        try
        {
            if (!string.IsNullOrWhiteSpace(target.Email))
            {
                var html = $"<p>Адміністратор <strong>{System.Net.WebUtility.HtmlEncode(adminFullName)}</strong> "
                    + $"увійшов під вашим акаунтом {kyivNow:dd.MM.yyyy HH:mm} (Київ).</p>"
                    + $"<p>Причина: {System.Net.WebUtility.HtmlEncode(reason.Trim())}</p>"
                    + $"<p>Сесія діє 60 хвилин. Якщо ви не очікували цю дію — зверніться до підтримки.</p>";
                await _email.SendAsync(target.Email, "Сесія імперсонації AgroPlatform", html, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Impersonation email to {Email} failed (non-fatal).", target.Email);
        }

        var (token, expiresAt) = _jwt.GenerateImpersonationToken(target, adminId, originalTenantId, reason.Trim());

        return new ImpersonationResult(
            token,
            expiresAt,
            target.Id,
            target.Email ?? string.Empty,
            target.FirstName ?? string.Empty,
            target.LastName ?? string.Empty,
            target.TenantId,
            tenantName);
    }

    public async Task<ImpersonationEndResult> EndAsync(CancellationToken cancellationToken = default)
    {
        var adminId = _currentUser.ImpersonatedByUserId
            ?? throw new InvalidOperationException("Current request is not running under an impersonation token.");

        var admin = await _userManager.FindByIdAsync(adminId)
            ?? throw new InvalidOperationException("Original super-admin record not found.");

        // The original user MUST still be a super-admin — defensive check against
        // the case where their privileges were revoked mid-session.
        if (!admin.IsSuperAdmin)
            throw new InvalidOperationException("Original user is no longer a super-admin.");

        await _audit.LogAsync(
            ActionEnd,
            targetType: "User",
            targetId: _currentUser.UserId,
            before: null,
            after: new { ended_at_utc = DateTime.UtcNow },
            cancellationToken);

        var (token, expiresAt) = _jwt.GenerateToken(admin);
        return new ImpersonationEndResult(token, expiresAt);
    }

    public async Task LogForbiddenAttemptAsync(string attemptedRoute, CancellationToken cancellationToken = default)
    {
        try
        {
            await _audit.LogAsync(
                ActionForbiddenAttempt,
                targetType: "User",
                targetId: _currentUser.UserId,
                before: null,
                after: new
                {
                    impersonated_by = _currentUser.ImpersonatedByUserId,
                    attempted_route = attemptedRoute,
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write impersonate.forbidden_attempt audit row.");
        }
    }

    private static DateTime ConvertToKyiv(DateTime utc)
    {
        try
        {
            var tz = TryFindKyiv();
            return TimeZoneInfo.ConvertTimeFromUtc(utc, tz);
        }
        catch
        {
            return utc;
        }
    }

    private static TimeZoneInfo TryFindKyiv()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv"); }
        catch { /* fall through */ }
        try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Kiev"); }
        catch { return TimeZoneInfo.Utc; }
    }
}
