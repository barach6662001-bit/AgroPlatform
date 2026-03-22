using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Sales;

[Collection("Integration Tests")]
public class SalesControllerTests : IntegrationTestBase
{
    public SalesControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateSaleAsync(string product = "Wheat")
    {
        var response = await PostAsync("/api/sales", new
        {
            date = DateTime.UtcNow.Date.ToString("o"),
            buyerName = "Test Buyer",
            product,
            quantity = 10.5,
            unit = "т",
            pricePerUnit = 5000.0,
            currency = "UAH",
            notes = $"Test sale of {product}"
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateSale_ReturnsCreated()
    {
        var response = await PostAsync("/api/sales", new
        {
            date = DateTime.UtcNow.Date.ToString("o"),
            buyerName = "Agro Buyer Ltd",
            product = "Corn",
            quantity = 20.0,
            unit = "т",
            pricePerUnit = 4500.0,
            currency = "UAH"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetSales_ReturnsOk()
    {
        await CreateSaleAsync("Barley");

        var result = await GetAsync<JsonElement>("/api/sales");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task DeleteSale_ReturnsNoContent()
    {
        var saleId = await CreateSaleAsync("Sunflower");

        var response = await DeleteAsync($"/api/sales/{saleId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
