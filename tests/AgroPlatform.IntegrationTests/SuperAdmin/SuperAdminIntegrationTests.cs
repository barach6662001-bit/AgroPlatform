using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.SuperAdmin;
using AgroPlatform.Domain.Users;
using AgroPlatform.Infrastructure.Identity;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AgroPlatform.IntegrationTests.SuperAdmin;

/// <summary>
/// Integration tests covering the deferred super-admin / MFA coverage from PR #610.
/// Does not modify super-admin logic — only exercises the production code paths
/// via the <c>X-Test-*</c> headers implemented in <see cref="TestAuthHandler"/>.
/// </summary>
[Collection("Integration Tests")]
public sealed class SuperAdminIntegrationTests : IntegrationTestBase
{
    public SuperAdminIntegrationTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    // ── (a) no super-admin claim ────────────────────────────────────────────

    [Fact]
    public async Task GetTenants_WithoutSuperAdminClaim_Returns403()
    {
        using var client = CreateAdminClient();
        // No X-Test-IsSuperAdmin header → filter denies.
        var response = await client.GetAsync("/api/admin/tenants");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ── (b) / (h) super-admin but MFA not set up → 403 + X-Mfa-Required ────

    [Fact]
    public async Task GetTenants_SuperAdminWithoutMfaSettings_Returns403WithMfaRequiredHeader()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: false);

        using var client = CreateAdminClient();
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-User-Id", userId);

        var response = await client.GetAsync("/api/admin/tenants");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        response.Headers.TryGetValues("X-Mfa-Required", out var values).Should().BeTrue();
        values!.Should().ContainSingle().Which.Should().Be("true");
    }

    // ── (c) super-admin + mfa_verified → 200, cross-tenant data ────────────

    [Fact]
    public async Task GetTenants_SuperAdminWithMfa_ReturnsTenantsFromMultipleTenants()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true);
        var tenantA = await EnsureTenantAsync("Super-Admin Test Tenant A");
        var tenantB = await EnsureTenantAsync("Super-Admin Test Tenant B");

        using var client = CreateAdminClient();
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-MfaVerified", "true");
        client.DefaultRequestHeaders.Add("X-Test-User-Id", userId);

        var response = await client.GetAsync("/api/admin/tenants?pageSize=100");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<TenantListResponse>(JsonOptions);
        payload.Should().NotBeNull();
        var ids = payload!.Items.Select(t => t.Id).ToList();
        ids.Should().Contain(tenantA);
        ids.Should().Contain(tenantB);
        // Proves IgnoreQueryFilters bypassed tenant filter: at least two distinct tenant IDs present.
        ids.Distinct().Count().Should().BeGreaterThanOrEqualTo(2);
    }

    // ── (d) PUT features → exactly one SuperAdminAuditLog row ──────────────

    [Fact]
    public async Task PutFeatures_SuperAdminWithMfa_CreatesExactlyOneAuditLogEntry()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true);
        var tenantId = await EnsureTenantAsync("Features Audit Tenant");

        using var client = CreateAdminClient();
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-MfaVerified", "true");
        client.DefaultRequestHeaders.Add("X-Test-User-Id", userId);

        int countBefore;
        using (var scope = CreateScope())
        {
            countBefore = await GetDbContext(scope).SuperAdminAuditLogs.CountAsync();
        }

        var body = new
        {
            features = new[]
            {
                new { key = "budget", isEnabled = true },
                new { key = "pnl_by_fields", isEnabled = false },
            }
        };
        var response = await client.PutAsJsonAsync($"/api/admin/tenants/{tenantId}/features", body, JsonOptions);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var verifyScope = CreateScope();
        var db = GetDbContext(verifyScope);
        var countAfter = await db.SuperAdminAuditLogs.CountAsync();
        (countAfter - countBefore).Should().Be(1, "exactly one audit log entry should be written per features update");

        var entry = await db.SuperAdminAuditLogs
            .OrderByDescending(x => x.OccurredAt)
            .FirstAsync();

        entry.Action.Should().Be("tenant.features.update");
        entry.TargetType.Should().Be(nameof(Tenant));
        entry.TargetId.Should().Be(tenantId.ToString());
        entry.AdminUserId.Should().Be(userId);

        entry.Before.Should().NotBeNullOrWhiteSpace();
        entry.After.Should().NotBeNullOrWhiteSpace();

        using var afterDoc = JsonDocument.Parse(entry.After!);
        afterDoc.RootElement.TryGetProperty("budget", out var budgetEl).Should().BeTrue();
        budgetEl.GetBoolean().Should().BeTrue();
    }

    // ── (e) backup code one-shot semantics ─────────────────────────────────

    [Fact]
    public async Task MfaVerify_BackupCode_WorksOnceThenRejected()
    {
        const string plaintextBackupCode = "ABCD1234";

        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true, plaintextBackupCodes: new[] { plaintextBackupCode });

        var mfaPendingToken = await IssueMfaPendingTokenAsync(userId);

        using var client = Factory.CreateClient();

        // First use → 200
        var firstResponse = await client.PostAsJsonAsync(
            "/api/auth/mfa/verify",
            new { mfaPendingToken, code = (string?)null, backupCode = plaintextBackupCode },
            JsonOptions);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Need a fresh mfa_pending token for the replay attempt; same semantics.
        var secondToken = await IssueMfaPendingTokenAsync(userId);

        // Second use → 401
        var secondResponse = await client.PostAsJsonAsync(
            "/api/auth/mfa/verify",
            new { mfaPendingToken = secondToken, code = (string?)null, backupCode = plaintextBackupCode },
            JsonOptions);
        secondResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── (f) invalid TOTP code → 401 ────────────────────────────────────────

    [Fact]
    public async Task MfaVerify_InvalidTotp_Returns401()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true);
        var token = await IssueMfaPendingTokenAsync(userId);

        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/auth/mfa/verify",
            new { mfaPendingToken = token, code = "000000", backupCode = (string?)null },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── (g) expired mfa_pending token → 401 ───────────────────────────────

    [Fact]
    public async Task MfaVerify_ExpiredToken_Returns401()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true);
        var expiredToken = IssueExpiredMfaPendingToken(userId);

        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/auth/mfa/verify",
            new { mfaPendingToken = expiredToken, code = "123456", backupCode = (string?)null },
            JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── (h) mfa_pending scope session cannot reach /api/admin/* ───────────

    [Fact]
    public async Task GetTenants_WithMfaPendingScope_Returns403()
    {
        var userId = await EnsureSuperAdminUserAsync(mfaEnabled: true);

        using var client = CreateAdminClient();
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-User-Id", userId);
        // scope=mfa_pending explicitly drives MfaVerified → false in CurrentUserService.
        client.DefaultRequestHeaders.Add("X-Test-Scope", "mfa_pending");

        var response = await client.GetAsync("/api/admin/tenants");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private HttpClient CreateAdminClient()
    {
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        return client;
    }

    private async Task<string> EnsureSuperAdminUserAsync(bool mfaEnabled, IEnumerable<string>? plaintextBackupCodes = null)
    {
        using var scope = CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var db = GetDbContext(scope);

        var email = $"sa-test-{Guid.NewGuid():N}@example.com";
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = "SA",
            LastName = "Test",
            Role = AgroPlatform.Domain.Enums.UserRole.SuperAdmin,
            TenantId = Guid.Empty,
            IsActive = true,
            IsSuperAdmin = true,
        };
        var createResult = await userManager.CreateAsync(user, "Temp!Password123");
        createResult.Succeeded.Should().BeTrue(because: string.Join(", ", createResult.Errors.Select(e => e.Description)));

        if (mfaEnabled)
        {
            var mfa = scope.ServiceProvider.GetRequiredService<IMfaService>();
            var secret = mfa.GenerateSecret();
            var hashes = (plaintextBackupCodes ?? Array.Empty<string>())
                .Select(c => BCrypt.Net.BCrypt.HashPassword(c.ToUpperInvariant()))
                .ToList();

            db.UserMfaSettings.Add(new UserMfaSettings
            {
                UserId = user.Id,
                SecretKey = secret,
                IsEnabled = true,
                BackupCodes = JsonSerializer.Serialize(hashes),
                EnabledAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
        }

        return user.Id;
    }

    private async Task<Guid> EnsureTenantAsync(string name)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = name,
            IsActive = true,
        };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();
        return tenant.Id;
    }

    private Task<string> IssueMfaPendingTokenAsync(string userId)
    {
        using var scope = CreateScope();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<JwtSettings>>().Value;
        return Task.FromResult(BuildMfaPendingToken(settings, userId, DateTime.UtcNow.AddMinutes(5)));
    }

    private string IssueExpiredMfaPendingToken(string userId)
    {
        using var scope = CreateScope();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<JwtSettings>>().Value;
        // Expired 10 minutes ago.
        return BuildMfaPendingToken(settings, userId, DateTime.UtcNow.AddMinutes(-10));
    }

    private static string BuildMfaPendingToken(JwtSettings settings, string userId, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim("scope", "mfa_pending"),
        };
        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            // notBefore must be <= expires; for expired tokens we set notBefore in the far past.
            notBefore: expiresAt.AddMinutes(-5),
            expires: expiresAt,
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private sealed class TenantListResponse
    {
        public List<TenantListItem> Items { get; set; } = new();
        public int Total { get; set; }
    }

    private sealed class TenantListItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
