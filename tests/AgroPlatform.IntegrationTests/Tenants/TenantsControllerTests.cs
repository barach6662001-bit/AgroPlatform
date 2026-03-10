using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Application.Tenants.DTOs;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Tenants;

[Collection("Integration Tests")]
public class TenantsControllerTests : IntegrationTestBase
{
    // Use a client without X-Tenant-Id header for the anonymous registration endpoint
    private readonly HttpClient _anonClient;

    public TenantsControllerTests(CustomWebApplicationFactory<Program> factory)
        : base(factory)
    {
        _anonClient = factory.CreateClient();
    }

    [Fact]
    public async Task RegisterTenant_ValidRequest_Returns201WithTenantDto()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = "New Farm Organization",
            inn = (string?)null
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var tenant = await response.Content.ReadFromJsonAsync<TenantDto>(JsonOptions);
        tenant.Should().NotBeNull();
        tenant!.Id.Should().NotBeEmpty();
        tenant.Name.Should().Be("New Farm Organization");
        tenant.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterTenant_WithInn_Returns201WithInn()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = "Farm With INN Test",
            inn = "1234567890"
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var tenant = await response.Content.ReadFromJsonAsync<TenantDto>(JsonOptions);
        tenant!.Inn.Should().Be("1234567890");
    }

    [Fact]
    public async Task RegisterTenant_Returns201WithLocationHeader()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = "Location Header Farm"
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task RegisterTenant_DuplicateName_Returns409Conflict()
    {
        var name = $"Duplicate Farm {Guid.NewGuid()}";

        // First registration
        var first = await _anonClient.PostAsJsonAsync("/api/tenants/register", new { name }, JsonOptions);
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        // Second registration with the same name
        var second = await _anonClient.PostAsJsonAsync("/api/tenants/register", new { name }, JsonOptions);
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task RegisterTenant_EmptyName_Returns400BadRequest()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = ""
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RegisterTenant_MissingName_Returns400BadRequest()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            inn = "123"
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RegisterTenant_NameTooLong_Returns400BadRequest()
    {
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = new string('A', 201)
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RegisterTenant_WithoutTenantIdHeader_Returns201()
    {
        // Endpoint should work without X-Tenant-Id header (anonymous onboarding)
        var response = await _anonClient.PostAsJsonAsync("/api/tenants/register", new
        {
            name = $"Anonymous Farm {Guid.NewGuid()}"
        }, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
