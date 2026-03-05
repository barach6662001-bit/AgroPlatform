using System.Net;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Middleware;

[Collection("Integration Tests")]
public class TenantMiddlewareTests : IntegrationTestBase
{
    public TenantMiddlewareTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task MissingTenantIdHeader_ReturnsBadRequest_WithDetailBody()
    {
        var clientWithoutTenant = Factory.CreateClient();

        var response = await clientWithoutTenant.GetAsync("/api/warehouses");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content).RootElement;
        json.GetProperty("detail").GetString().Should().Contain("X-Tenant-Id");
    }

    [Fact]
    public async Task InvalidTenantIdHeader_NotGuid_ReturnsBadRequest_WithDetailBody()
    {
        var clientWithInvalidTenant = Factory.CreateClient();
        clientWithInvalidTenant.DefaultRequestHeaders.Add("X-Tenant-Id", "not-a-valid-guid");

        var response = await clientWithInvalidTenant.GetAsync("/api/warehouses");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content).RootElement;
        json.GetProperty("detail").GetString().Should().Contain("valid GUID");
    }

    [Fact]
    public async Task ValidTenantIdHeader_RequestFlowsThroughMiddleware_ReturnsSuccess()
    {
        // Client already has valid X-Tenant-Id set by IntegrationTestBase
        var response = await Client.GetAsync("/api/warehouses");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
