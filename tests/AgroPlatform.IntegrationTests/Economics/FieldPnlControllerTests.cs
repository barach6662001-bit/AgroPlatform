using System.Net;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Economics;

[Collection("Integration Tests")]
public class FieldPnlControllerTests : IntegrationTestBase
{
    public FieldPnlControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task GetFieldPnl_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/economics/field-pnl");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetFieldPnl_WithYear_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/economics/field-pnl?year=2025");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetFieldPnl_WithPriceParam_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/economics/field-pnl?year=2025&estimatedPricePerTonne=8000");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
