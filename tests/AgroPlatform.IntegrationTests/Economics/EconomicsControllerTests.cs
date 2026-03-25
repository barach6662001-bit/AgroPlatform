using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Economics;

[Collection("Integration Tests")]
public class EconomicsControllerTests : IntegrationTestBase
{
    public EconomicsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateCostRecordAsync(string category = "Seeds")
    {
        var response = await PostAsync("/api/economics/cost-records", new
        {
            category,
            amount = 5000.0,
            currency = "USD",
            date = DateTime.UtcNow.Date.ToString("o"),
            description = $"Test cost record for {category}"
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateCostRecord_ReturnsCreated()
    {
        var response = await PostAsync("/api/economics/cost-records", new
        {
            category = "Fertilizer",
            amount = 10000.0,
            currency = "USD",
            date = DateTime.UtcNow.Date.ToString("o"),
            description = "Annual fertilizer purchase"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetCostRecords_ReturnsOk()
    {
        await CreateCostRecordAsync("Pesticide");

        var result = await GetAsync<JsonElement>("/api/economics/cost-records");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task DeleteCostRecord_ReturnsNoContent()
    {
        var costId = await CreateCostRecordAsync("Fuel");

        var response = await DeleteAsync($"/api/economics/cost-records/{costId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task GetBreakEven_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/economics/break-even?year=2025&pricePerTonne=5000");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.ValueKind.Should().Be(JsonValueKind.Array);
    }

    [Fact]
    public async Task GetBreakEven_WithZeroPrice_ReturnsNullBreakEvenYield()
    {
        var response = await Client.GetAsync("/api/economics/break-even?year=2025&pricePerTonne=0");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.ValueKind.Should().Be(JsonValueKind.Array);
        // With pricePerTonne=0, all breakEvenYield values must be null
        foreach (var item in result.EnumerateArray())
        {
            item.GetProperty("breakEvenYield").ValueKind.Should().Be(JsonValueKind.Null);
        }
    }
}
