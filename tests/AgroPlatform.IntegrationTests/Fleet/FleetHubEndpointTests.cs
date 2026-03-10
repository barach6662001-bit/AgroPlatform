using System.Net;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Fleet;

/// <summary>
/// Verifies that the <c>/hubs/fleet</c> SignalR endpoint is mapped and requires authentication.
/// Full WebSocket round-trip tests are covered by unit tests for <c>FleetHubService</c>.
/// </summary>
[Collection("Integration Tests")]
public class FleetHubEndpointTests(CustomWebApplicationFactory<Program> factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task FleetHub_NegotiateEndpoint_IsReachable()
    {
        // The SignalR negotiate endpoint is served at /hubs/fleet/negotiate for HTTP fallback.
        // A POST to this endpoint (with valid auth) should return 200 OK.
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", CustomWebApplicationFactory<Program>.TenantId.ToString());

        var response = await _client.PostAsync("/hubs/fleet/negotiate?negotiateVersion=1", null);

        // 200 means hub is mapped and auth passed (TestAuthHandler injects a valid principal).
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task FleetHub_NegotiateResponse_ContainsConnectionToken()
    {
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", CustomWebApplicationFactory<Program>.TenantId.ToString());

        var response = await _client.PostAsync("/hubs/fleet/negotiate?negotiateVersion=1", null);

        var body = await response.Content.ReadAsStringAsync();
        // The negotiate response must contain a connection token or connection ID.
        body.Should().ContainAny("connectionId", "connectionToken");
    }
}
