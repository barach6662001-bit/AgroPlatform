using System.Net;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AgroPlatform.IntegrationTests;

[Collection("Integration Tests")]
public class HealthChecksTests(CustomWebApplicationFactory<Program> factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task LiveEndpoint_Returns200()
    {
        var response = await _client.GetAsync("/health/live");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ReadyEndpoint_Returns200_WhenDbReachable()
    {
        var response = await _client.GetAsync("/health/ready");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ReadyEndpoint_Returns503_WhenDbUnavailable()
    {
        await using var unhealthyFactory = new UnhealthyDbFactory();
        await unhealthyFactory.InitializeAsync();
        var client = unhealthyFactory.CreateClient();

        var response = await client.GetAsync("/health/ready");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    private class UnhealthyDbFactory : CustomWebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.ConfigureServices(services =>
            {
                // Remove all existing health check registrations so the real DB check is replaced
                services.RemoveAll<IHealthCheckPublisher>();
                services.PostConfigure<HealthCheckServiceOptions>(options =>
                {
                    options.Registrations.Clear();
                    options.Registrations.Add(new HealthCheckRegistration(
                        "db",
                        _ => new AlwaysUnhealthyCheck(),
                        HealthStatus.Unhealthy,
                        ["ready"]));
                });
            });
        }
    }

    private class AlwaysUnhealthyCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
            => Task.FromResult(HealthCheckResult.Unhealthy("Database connection failed"));
    }
}