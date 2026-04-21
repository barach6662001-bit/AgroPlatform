using System.Net;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Analytics;

[Collection("Integration Tests")]
public class AnalyticsControllerTests : IntegrationTestBase
{
    public AnalyticsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task GetDashboard_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/analytics/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
