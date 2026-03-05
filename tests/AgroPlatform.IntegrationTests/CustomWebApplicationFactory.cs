using AgroPlatform.Domain.Users;
using AgroPlatform.Infrastructure.Persistence;
using AgroPlatform.Infrastructure.Persistence.Interceptors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace AgroPlatform.IntegrationTests;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>
    where TProgram : class
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    public static readonly Guid TenantId = new Guid("00000000-0000-0000-0000-000000000001");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase(_dbName);
                options.AddInterceptors(
                    sp.GetRequiredService<AuditableEntityInterceptor>(),
                    sp.GetRequiredService<SoftDeleteInterceptor>(),
                    sp.GetRequiredService<TenantInterceptor>());
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        db.Tenants.Add(new Tenant
        {
            Id = TenantId,
            Name = "Test Tenant",
            IsActive = true
        });
        db.SaveChanges();

        return host;
    }
}
