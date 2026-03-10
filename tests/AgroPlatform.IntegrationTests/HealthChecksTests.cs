using System.Net;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

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
                // Clear all existing health check registrations (incl. AddDbContextCheck from Program.cs)
                // then add a single always-unhealthy check tagged "ready"
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