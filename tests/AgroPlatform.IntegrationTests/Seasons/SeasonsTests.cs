using System.Net;
using System.Net.Http.Json;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Seasons;
using AgroPlatform.Domain.Users;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests.Seasons;

[Collection("Integration Tests")]
public sealed class SeasonsTests : IntegrationTestBase
{
    public SeasonsTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    private sealed record SeasonDto(Guid Id, string Code, string Name, DateOnly StartDate, DateOnly EndDate, bool IsCurrent);

    private HttpClient CreateAdminClient(string role = "CompanyAdmin", Guid? tenantId = null)
    {
        var client = Factory.CreateClient();
        var tid = tenantId ?? TenantId;
        client.DefaultRequestHeaders.Add("X-Tenant-Id", tid.ToString());
        client.DefaultRequestHeaders.Add("X-Test-Tenant-Id", tid.ToString());
        client.DefaultRequestHeaders.Add("X-Test-Role", role);
        return client;
    }

    private HttpClient CreateSuperAdminClient()
    {
        // The [SuperAdminRequired] filter also requires a UserMfaSettings row with
        // IsEnabled=true for the authenticated user id. Seed it once per test run.
        EnsureTestUserMfaEnabledAsync().GetAwaiter().GetResult();

        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        client.DefaultRequestHeaders.Add("X-Test-Role", "SuperAdmin");
        client.DefaultRequestHeaders.Add("X-Test-IsSuperAdmin", "true");
        client.DefaultRequestHeaders.Add("X-Test-MfaVerified", "true");
        return client;
    }

    private async Task EnsureTestUserMfaEnabledAsync()
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var userId = TestAuthHandler.TestUserId.ToString();

        // FK requires a real AspNetUsers row before we can add UserMfaSettings.
        var userExists = await db.Users.IgnoreQueryFilters().AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            db.Users.Add(new AppUser
            {
                Id = userId,
                UserName = "test-super@example.com",
                NormalizedUserName = "TEST-SUPER@EXAMPLE.COM",
                Email = "test-super@example.com",
                NormalizedEmail = "TEST-SUPER@EXAMPLE.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString(),
                FirstName = "Test",
                LastName = "SuperAdmin",
                Role = UserRole.SuperAdmin,
                TenantId = Guid.Empty,
                IsActive = true,
                IsSuperAdmin = true,
            });
            await db.SaveChangesAsync();
        }

        var existing = await db.UserMfaSettings.FirstOrDefaultAsync(x => x.UserId == userId);
        if (existing is not null)
        {
            if (!existing.IsEnabled)
            {
                existing.IsEnabled = true;
                await db.SaveChangesAsync();
            }
            return;
        }
        db.UserMfaSettings.Add(new AgroPlatform.Domain.Users.UserMfaSettings
        {
            UserId = userId,
            SecretKey = "JBSWY3DPEHPK3PXP", // any valid base32; not exercised by SuperAdminRequiredFilter.
            IsEnabled = true,
            BackupCodes = "[]",
            EnabledAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }

    private async Task<Guid> SeedSeasonAsync(Guid tenantId, string code, DateOnly start, DateOnly end, bool isCurrent)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        // If setting current, clear any existing current first to satisfy partial unique index.
        // IgnoreQueryFilters because test scopes have no HTTP context → DbContext's
        // global tenant filter would otherwise hide every season row from this read.
        if (isCurrent)
        {
            var curr = await db.Seasons.IgnoreQueryFilters()
                .Where(s => s.TenantId == tenantId && s.IsCurrent && !s.IsDeleted).ToListAsync();
            foreach (var c in curr) c.IsCurrent = false;
            if (curr.Count > 0) await db.SaveChangesAsync();
        }
        var season = new Season
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Code = code,
            Name = $"Сезон {code}",
            StartDate = start,
            EndDate = end,
            IsCurrent = isCurrent,
        };
        db.Seasons.Add(season);
        await db.SaveChangesAsync();
        return season.Id;
    }

    // 1. Tenant-scoped GET returns only own tenant's seasons.
    [Fact]
    public async Task List_ReturnsOnlySeasonsOfCurrentTenant()
    {
        var otherTenantId = Guid.NewGuid();
        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            db.Tenants.Add(new Tenant { Id = otherTenantId, Name = "Other Tenant", IsActive = true });
            await db.SaveChangesAsync();
        }

        var mine = await SeedSeasonAsync(TenantId, $"T-{Guid.NewGuid():N}".Substring(0, 8), new DateOnly(2024, 8, 1), new DateOnly(2025, 7, 31), false);
        var other = await SeedSeasonAsync(otherTenantId, $"O-{Guid.NewGuid():N}".Substring(0, 8), new DateOnly(2024, 8, 1), new DateOnly(2025, 7, 31), false);

        using var client = CreateAdminClient();
        var items = await client.GetFromJsonAsync<List<SeasonDto>>("/api/seasons", JsonOptions);
        items.Should().NotBeNull();
        items!.Should().Contain(s => s.Id == mine);
        items.Select(s => s.Id).Should().NotContain(other);
    }

    // 2. SetCurrent flips exactly one IsCurrent=true per tenant.
    [Fact]
    public async Task SetCurrent_FlipsExactlyOneCurrentSeason()
    {
        var codeA = $"A-{Guid.NewGuid():N}".Substring(0, 8);
        var codeB = $"B-{Guid.NewGuid():N}".Substring(0, 8);
        var a = await SeedSeasonAsync(TenantId, codeA, new DateOnly(2022, 8, 1), new DateOnly(2023, 7, 31), true);
        var b = await SeedSeasonAsync(TenantId, codeB, new DateOnly(2023, 8, 1), new DateOnly(2024, 7, 31), false);

        using var client = CreateAdminClient();
        var resp = await client.PostAsync($"/api/seasons/{b}/set-current", content: null);
        resp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var currents = await db.Seasons.IgnoreQueryFilters()
            .Where(s => s.TenantId == TenantId && s.IsCurrent && !s.IsDeleted).ToListAsync();
        currents.Should().ContainSingle().Which.Id.Should().Be(b);

        var aReloaded = await db.Seasons.IgnoreQueryFilters().FirstAsync(s => s.Id == a);
        aReloaded.IsCurrent.Should().BeFalse();
    }

    // 3. Delete blocked when linked CostRecord falls in season range (tenant admin).
    [Fact]
    public async Task Delete_WithLinkedCostRecord_Returns409ForTenantAdmin()
    {
        var code = $"D-{Guid.NewGuid():N}".Substring(0, 8);
        var seasonId = await SeedSeasonAsync(TenantId, code, new DateOnly(2020, 8, 1), new DateOnly(2021, 7, 31), false);

        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            db.CostRecords.Add(new CostRecord
            {
                Id = Guid.NewGuid(),
                TenantId = TenantId,
                Category = CostCategory.Other,
                Amount = 100m,
                Currency = "UAH",
                Date = new DateTime(2021, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                Description = "linked cost record",
            });
            await db.SaveChangesAsync();
        }

        using var client = CreateAdminClient();
        var resp = await client.DeleteAsync($"/api/seasons/{seasonId}");
        resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    // 4. Super-admin can force-delete even with linked records.
    [Fact]
    public async Task Delete_ForceByPlatformSuperAdmin_DeletesDespiteLinkedCostRecord()
    {
        var code = $"F-{Guid.NewGuid():N}".Substring(0, 8);
        var seasonId = await SeedSeasonAsync(TenantId, code, new DateOnly(2019, 8, 1), new DateOnly(2020, 7, 31), false);

        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            db.CostRecords.Add(new CostRecord
            {
                Id = Guid.NewGuid(),
                TenantId = TenantId,
                Category = CostCategory.Other,
                Amount = 50m,
                Currency = "UAH",
                Date = new DateTime(2019, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                Description = "linked cost record 2",
            });
            await db.SaveChangesAsync();
        }

        using var client = CreateSuperAdminClient();
        var resp = await client.DeleteAsync($"/api/seasons/{seasonId}?force=true");
        resp.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // 5. Non-admin (Manager) cannot create → 403.
    [Fact]
    public async Task Create_AsNonAdmin_Returns403()
    {
        using var client = CreateAdminClient(role: "Manager");
        var resp = await client.PostAsJsonAsync("/api/seasons", new
        {
            code = $"N-{Guid.NewGuid():N}".Substring(0, 8),
            name = "Manager-attempt",
            startDate = "2030-08-01",
            endDate = "2031-07-31",
            isCurrent = false,
        }, JsonOptions);

        resp.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // 6. Super-admin creating a season through /api/admin/... writes exactly one audit log entry.
    [Fact]
    public async Task SuperAdmin_Create_WritesExactlyOneAuditLogEntry()
    {
        int before;
        using (var scope = CreateScope())
        {
            before = await GetDbContext(scope).SuperAdminAuditLogs.CountAsync();
        }

        using var client = CreateSuperAdminClient();
        var resp = await client.PostAsJsonAsync($"/api/admin/tenants/{TenantId}/seasons", new
        {
            code = $"S-{Guid.NewGuid():N}".Substring(0, 8),
            name = "SuperAdmin-created",
            startDate = "2028-08-01",
            endDate = "2029-07-31",
            isCurrent = false,
        }, JsonOptions);
        resp.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope2 = CreateScope();
        var db = GetDbContext(scope2);
        var after = await db.SuperAdminAuditLogs.CountAsync();
        (after - before).Should().Be(1);

        var entry = await db.SuperAdminAuditLogs.OrderByDescending(x => x.OccurredAt).FirstAsync();
        entry.Action.Should().Be("season.create");
        entry.TargetType.Should().Be(nameof(Season));
    }
}
