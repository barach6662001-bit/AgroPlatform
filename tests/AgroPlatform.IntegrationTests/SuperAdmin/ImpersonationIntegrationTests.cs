using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.SuperAdmin;
using AgroPlatform.Domain.Users;
using AgroPlatform.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests.SuperAdmin;

/// <summary>
/// Integration tests for the PR #614 super-admin impersonation engine.
/// Covers the 6 minimum scenarios required by the feature spec:
///   1. Non-super-admin caller → 403
///   2. Super-admin without MFA → 403 + X-Mfa-Required
///   3. Valid start → 200 + audit row + Notification row + token claims correct
///   4. Reason &lt; 10 chars → 400
///   5. Rate limit (4th attempt in 24h on same target) → 429
///   6. Forbidden action under impersonation token → 403 + impersonate.forbidden_attempt audit row
/// </summary>
[Collection("Integration Tests")]
public sealed class ImpersonationIntegrationTests : IntegrationTestBase
{
    public ImpersonationIntegrationTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    // ── (1) caller is not super-admin → 403 ─────────────────────────────────

    [Fact]
    public async Task Start_WithoutSuperAdminClaim_Returns403()
    {
        var (_, targetId) = await EnsureTenantAndTargetUserAsync("plain-tenant");

        using var client = CreateBaseClient();
        // No X-Test-IsSuperAdmin → SuperAdminRequired filter denies.
        var response = await client.PostAsJsonAsync(
            "/api/admin/impersonate",
            new { TargetUserId = targetId, Reason = "Customer support investigation 123" },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ── (2) super-admin but MFA not configured → 403 + X-Mfa-Required ───────

    [Fact]
    public async Task Start_SuperAdminWithoutMfa_Returns403WithMfaRequiredHeader()
    {
        var adminId = await EnsureSuperAdminAsync(mfaEnabled: false);
        var (_, targetId) = await EnsureTenantAndTargetUserAsync("mfa-test-tenant");

        using var client = CreateBaseClient();
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-User-Id", adminId);

        var response = await client.PostAsJsonAsync(
            "/api/admin/impersonate",
            new { TargetUserId = targetId, Reason = "Customer support investigation 123" },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        response.Headers.TryGetValues("X-Mfa-Required", out var values).Should().BeTrue();
        values!.Should().ContainSingle().Which.Should().Be("true");
    }

    // ── (3) happy path → 200 + token + audit row + Notification row ─────────

    [Fact]
    public async Task Start_HappyPath_ReturnsTokenAndPersistsAuditAndNotification()
    {
        var adminId = await EnsureSuperAdminAsync(mfaEnabled: true);
        var (tenantId, targetId) = await EnsureTenantAndTargetUserAsync("happy-path-tenant");

        int auditBefore;
        int notificationsBefore;
        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            auditBefore = await db.SuperAdminAuditLogs.CountAsync();
            notificationsBefore = await db.Notifications.IgnoreQueryFilters().CountAsync(n => n.TenantId == tenantId);
        }

        using var client = CreateSuperAdminClient(adminId);
        var response = await client.PostAsJsonAsync(
            "/api/admin/impersonate",
            new { TargetUserId = targetId, Reason = "Customer reported missing field data — investigating" },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        payload.GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        payload.GetProperty("expiresAtUtc").GetDateTime()
            .Should().BeAfter(DateTime.UtcNow.AddMinutes(58))
            .And.BeBefore(DateTime.UtcNow.AddMinutes(62));
        payload.GetProperty("targetUserId").GetString().Should().Be(targetId);
        payload.GetProperty("targetTenantId").GetGuid().Should().Be(tenantId);

        using var verify = CreateScope();
        var verifyDb = GetDbContext(verify);

        var auditAfter = await verifyDb.SuperAdminAuditLogs.CountAsync();
        (auditAfter - auditBefore).Should().Be(1);

        var entry = await verifyDb.SuperAdminAuditLogs
            .Where(x => x.AdminUserId == adminId && x.TargetId == targetId)
            .OrderByDescending(x => x.OccurredAt)
            .FirstAsync();
        entry.Action.Should().Be(ImpersonationService.ActionStart);
        entry.TargetType.Should().Be("User");
        entry.After.Should().NotBeNullOrWhiteSpace();

        var notifs = await verifyDb.Notifications
            .IgnoreQueryFilters()
            .Where(n => n.TenantId == tenantId)
            .ToListAsync();
        (notifs.Count - notificationsBefore).Should().Be(1);
        var n = notifs.OrderByDescending(x => x.CreatedAtUtc).First();
        n.Type.Should().Be("warning");
        n.Title.Should().Be("Сесія імперсонації");
        n.Body.Should().Contain("Причина: Customer reported missing field data — investigating");
    }

    // ── (4) reason < 10 chars → 400 ────────────────────────────────────────

    [Fact]
    public async Task Start_ReasonTooShort_Returns400()
    {
        var adminId = await EnsureSuperAdminAsync(mfaEnabled: true);
        var (_, targetId) = await EnsureTenantAndTargetUserAsync("short-reason-tenant");

        using var client = CreateSuperAdminClient(adminId);
        var response = await client.PostAsJsonAsync(
            "/api/admin/impersonate",
            new { TargetUserId = targetId, Reason = "too short" }, // 9 chars
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── (5) rate limit: 4th impersonation in 24h on same target → 429 ──────

    [Fact]
    public async Task Start_FourthAttemptInSameDay_Returns429()
    {
        var adminId = await EnsureSuperAdminAsync(mfaEnabled: true);
        var (_, targetId) = await EnsureTenantAndTargetUserAsync("rate-limit-tenant");

        // Pre-seed 3 prior 'impersonate.start' audit rows for this (admin, target) pair.
        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            for (var i = 0; i < 3; i++)
            {
                db.SuperAdminAuditLogs.Add(new SuperAdminAuditLog
                {
                    Id = Guid.NewGuid(),
                    AdminUserId = adminId,
                    Action = ImpersonationService.ActionStart,
                    TargetType = "User",
                    TargetId = targetId,
                    OccurredAt = DateTime.UtcNow.AddHours(-1 - i),
                });
            }
            await db.SaveChangesAsync();
        }

        using var client = CreateSuperAdminClient(adminId);
        var response = await client.PostAsJsonAsync(
            "/api/admin/impersonate",
            new { TargetUserId = targetId, Reason = "Yet another investigation reason" },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
    }

    // ── (6) forbidden action while impersonating → 403 + audit row ─────────

    [Fact]
    public async Task ChangePassword_DuringImpersonation_Returns403AndWritesForbiddenAttemptAudit()
    {
        var adminId = await EnsureSuperAdminAsync(mfaEnabled: true);
        var (_, targetId) = await EnsureTenantAndTargetUserAsync("forbidden-attempt-tenant");

        int auditBefore;
        using (var scope = CreateScope())
        {
            auditBefore = await GetDbContext(scope).SuperAdminAuditLogs
                .CountAsync(x => x.Action == ImpersonationService.ActionForbiddenAttempt);
        }

        using var client = CreateBaseClient();
        // Simulate an active impersonation token: target user identity + impersonated_by claim.
        client.DefaultRequestHeaders.Add("X-Test-User-Id", targetId);
        client.DefaultRequestHeaders.Add("X-Test-MfaVerified", "true");
        client.DefaultRequestHeaders.Add("X-Test-ImpersonatedBy", adminId);

        var response = await client.PostAsJsonAsync(
            "/api/auth/change-password",
            new { CurrentPassword = "Whatever1!", NewPassword = "NewWhatever1!" },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        using var verify = CreateScope();
        var auditAfter = await GetDbContext(verify).SuperAdminAuditLogs
            .CountAsync(x => x.Action == ImpersonationService.ActionForbiddenAttempt);
        (auditAfter - auditBefore).Should().Be(1, "the filter must persist a forbidden_attempt audit row before returning 403");
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private HttpClient CreateBaseClient()
    {
        var c = Factory.CreateClient();
        c.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        return c;
    }

    private HttpClient CreateSuperAdminClient(string adminUserId)
    {
        var c = CreateBaseClient();
        c.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        c.DefaultRequestHeaders.Add("X-Test-MfaVerified", "true");
        c.DefaultRequestHeaders.Add("X-Test-User-Id", adminUserId);
        return c;
    }

    private async Task<string> EnsureSuperAdminAsync(bool mfaEnabled)
    {
        using var scope = CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var db = GetDbContext(scope);

        var email = $"sa-imp-{Guid.NewGuid():N}@example.com";
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = "Super",
            LastName = "Admin",
            Role = AgroPlatform.Domain.Enums.UserRole.SuperAdmin,
            TenantId = Guid.Empty,
            IsActive = true,
            IsSuperAdmin = true,
        };
        var res = await userManager.CreateAsync(user, "Temp!Password123");
        res.Succeeded.Should().BeTrue(string.Join(", ", res.Errors.Select(e => e.Description)));

        if (mfaEnabled)
        {
            db.UserMfaSettings.Add(new AgroPlatform.Domain.Users.UserMfaSettings
            {
                UserId = user.Id,
                SecretKey = "AAAA1111BBBB2222CCCC",
                IsEnabled = true,
                BackupCodes = "[]",
                EnabledAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
        }

        return user.Id;
    }

    private async Task<(Guid TenantId, string UserId)> EnsureTenantAndTargetUserAsync(string namePrefix)
    {
        using var scope = CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var db = GetDbContext(scope);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = $"{namePrefix}-{Guid.NewGuid():N}",
            IsActive = true,
        };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var email = $"target-{Guid.NewGuid():N}@example.com";
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = "Target",
            LastName = "User",
            Role = AgroPlatform.Domain.Enums.UserRole.Manager,
            TenantId = tenant.Id,
            IsActive = true,
            IsSuperAdmin = false,
        };
        var res = await userManager.CreateAsync(user, "Temp!Password123");
        res.Succeeded.Should().BeTrue(string.Join(", ", res.Errors.Select(e => e.Description)));

        return (tenant.Id, user.Id);
    }
}
