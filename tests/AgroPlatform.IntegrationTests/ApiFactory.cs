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
using Testcontainers.PostgreSql;

namespace AgroPlatform.IntegrationTests;

public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgis/postgis:16-3.4-alpine")
        .WithDatabase("agroplatform_test")
        .WithUsername("agroplatform")
        .WithPassword("agroplatform_test")
        .Build();

    public static readonly Guid TenantId = new Guid("00000000-0000-0000-0000-000000000002");

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

            // Replace JWT auth with test authentication scheme
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
            Name = "API Test Tenant",
            IsActive = true
        });
        db.SaveChanges();

        return host;
    }

    public new async Task DisposeAsync()
    {
        await _postgres.StopAsync();
    }
}