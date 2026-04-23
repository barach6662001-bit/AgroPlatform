using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.RateLimiting;
using AgroPlatform.Domain.Users;
using AgroPlatform.Infrastructure.Persistence;
using AgroPlatform.Infrastructure.Persistence.Interceptors;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Testcontainers.PostgreSql;

namespace AgroPlatform.IntegrationTests;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>, IAsyncLifetime
    where TProgram : class
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgis/postgis:16-3.4-alpine")
        .WithDatabase("agroplatform_test_factory")
        .WithUsername("agroplatform")
        .WithPassword("agroplatform_test")
        .Build();

    public static readonly Guid TenantId = new Guid("00000000-0000-0000-0000-000000000001");

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                options.UseNpgsql(_postgres.GetConnectionString(), o => o.UseNetTopologySuite());
                options.AddInterceptors(
                    sp.GetRequiredService<AuditableEntityInterceptor>(),
                    sp.GetRequiredService<SoftDeleteInterceptor>(),
                    sp.GetRequiredService<TenantInterceptor>(),
                    sp.GetRequiredService<AuditInterceptor>());
            });

            // Disable rate limiting in tests
            services.PostConfigure<RateLimiterOptions>(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
                    _ => RateLimitPartition.GetNoLimiter("test"));
            });

            // Override authentication for tests
            services.AddAuthentication()
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
                options.DefaultForbidScheme = "Test";
                options.DefaultSignInScheme = "Test";
                options.DefaultSignOutScheme = "Test";
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        // Re-run seeding after EnsureCreated (initial seeding in Program.cs
        // runs before tables exist when using EnsureCreated instead of MigrateAsync)
        var config = host.Services.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        DataSeeder.SeedAsync(host.Services, config).GetAwaiter().GetResult();

        db.Tenants.Add(new Tenant
        {
            Id = TenantId,
            Name = "Test Tenant",
            IsActive = true
        });
        db.SaveChanges();

        return host;
    }

    public new async Task DisposeAsync()
    {
        await _postgres.StopAsync();
        await base.DisposeAsync();
    }
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public static readonly Guid TestUserId = Guid.NewGuid();
    public static readonly Guid TestTenantId = CustomWebApplicationFactory<Program>.TenantId;

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Allow per-request overrides via test-only headers so isolation tests
        // can simulate non-admin users and different JWT TenantId claims.
        var role = Request.Headers.TryGetValue("X-Test-Role", out var testRole)
            ? testRole.ToString()
            : "Administrator";

        var tenantId = Request.Headers.TryGetValue("X-Test-Tenant-Id", out var testTenantId)
            ? testTenantId.ToString()
            : Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenantId)
                ? headerTenantId.ToString()
                : TestTenantId.ToString();

        var userId = Request.Headers.TryGetValue("X-Test-User-Id", out var testUserId)
            ? testUserId.ToString()
            : TestUserId.ToString();

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "testuser@example.com"),
            new Claim(ClaimTypes.Email, "testuser@example.com"),
            new Claim(ClaimTypes.Role, role),
            new Claim("TenantId", tenantId),
        };

        // Super-admin / MFA test overrides (for PR #610 super-admin integration tests).
        if (Request.Headers.TryGetValue("X-Test-IsSuperAdmin", out var isSa)
            && bool.TryParse(isSa.ToString(), out var saBool) && saBool)
        {
            claims.Add(new Claim("is_super_admin", "true"));
        }

        if (Request.Headers.TryGetValue("X-Test-MfaVerified", out var mfaV)
            && bool.TryParse(mfaV.ToString(), out var mfaBool))
        {
            claims.Add(new Claim("mfa_verified", mfaBool ? "true" : "false"));
        }

        if (Request.Headers.TryGetValue("X-Test-Scope", out var scope)
            && !string.IsNullOrWhiteSpace(scope.ToString()))
        {
            claims.Add(new Claim("scope", scope.ToString()));
        }

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}