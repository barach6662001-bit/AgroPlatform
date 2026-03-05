using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Validation;

[Collection("Integration Tests")]
public class ValidationTests : IntegrationTestBase
{
    public ValidationTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task CreateWarehouse_WithEmptyName_ReturnsBadRequest()
    {
        var response = await PostAsync("/api/warehouses", new { name = "", location = "Somewhere" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ReceiptStock_WithNegativeQuantity_ReturnsBadRequest()
    {
        var warehouseResponse = await PostAsync("/api/warehouses", new { name = "Validation Warehouse" });
        var warehouseResult = await warehouseResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(JsonOptions);
        var warehouseId = warehouseResult.GetProperty("id").GetGuid();

        var itemResponse = await PostAsync("/api/warehouses/items", new
        {
            name = "Validation Item",
            code = $"VAL-{Guid.NewGuid():N}".Substring(0, 12),
            category = "Test",
            baseUnit = "kg"
        });
        var itemResult = await itemResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(JsonOptions);
        var itemId = itemResult.GetProperty("id").GetGuid();

        var response = await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = -10.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateField_WithZeroArea_ReturnsBadRequest()
    {
        var response = await PostAsync("/api/fields", new
        {
            name = "Zero Area Field",
            areaHectares = 0.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
