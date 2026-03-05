using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.AgroOperations;

[Collection("Integration Tests")]
public class AgroOperationsControllerTests : IntegrationTestBase
{
    public AgroOperationsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateFieldAsync(string name = "Test Field")
    {
        var response = await PostAsync("/api/fields", new
        {
            name,
            areaHectares = 50.0
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    private async Task<Guid> CreateAgroOperationAsync(Guid fieldId, string description = "Test Operation")
    {
        var response = await PostAsync("/api/agro-operations", new
        {
            fieldId,
            operationType = "Sowing",
            plannedDate = DateTime.UtcNow.AddDays(7).ToString("o"),
            description
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateAgroOperation_ReturnsCreated()
    {
        var fieldId = await CreateFieldAsync("Create Op Field");

        var response = await PostAsync("/api/agro-operations", new
        {
            fieldId,
            operationType = "Sowing",
            plannedDate = DateTime.UtcNow.AddDays(5).ToString("o"),
            description = "Spring sowing"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetAgroOperations_ReturnsPagedList()
    {
        var fieldId = await CreateFieldAsync("GetList Op Field");
        await CreateAgroOperationAsync(fieldId, "List Test Op");

        var result = await GetAsync<JsonElement>("/api/agro-operations");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
    }

    [Fact]
    public async Task GetAgroOperationById_ReturnsDetail()
    {
        var fieldId = await CreateFieldAsync("GetById Op Field");
        var opId = await CreateAgroOperationAsync(fieldId, "GetById Test Op");

        var result = await GetAsync<JsonElement>($"/api/agro-operations/{opId}");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("id").GetGuid().Should().Be(opId);
    }

    [Fact]
    public async Task CompleteAgroOperation_ReturnsNoContent()
    {
        var fieldId = await CreateFieldAsync("Complete Op Field");
        var opId = await CreateAgroOperationAsync(fieldId, "Complete Test Op");

        var response = await PostAsync($"/api/agro-operations/{opId}/complete", new
        {
            id = opId,
            completedDate = DateTime.UtcNow.ToString("o"),
            areaProcessed = 45.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task AddResource_ReturnsCreated()
    {
        var fieldId = await CreateFieldAsync("AddResource Field");
        var opId = await CreateAgroOperationAsync(fieldId, "AddResource Op");

        var warehouseResponse = await PostAsync("/api/warehouses", new { name = "Resource Warehouse" });
        var warehouseResult = await warehouseResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var warehouseId = warehouseResult.GetProperty("id").GetGuid();

        var itemResponse = await PostAsync("/api/warehouses/items", new
        {
            name = "Seed Item",
            code = $"SEED-{Guid.NewGuid():N}".Substring(0, 15),
            category = "Seeds",
            baseUnit = "kg"
        });
        var itemResult = await itemResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var itemId = itemResult.GetProperty("id").GetGuid();

        var response = await PostAsync($"/api/agro-operations/{opId}/resources", new
        {
            agroOperationId = opId,
            warehouseItemId = itemId,
            warehouseId,
            plannedQuantity = 100.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task AddMachinery_ReturnsCreated()
    {
        var fieldId = await CreateFieldAsync("AddMachinery Field");
        var opId = await CreateAgroOperationAsync(fieldId, "AddMachinery Op");

        var machineResponse = await PostAsync("/api/machinery", new
        {
            name = "Test Tractor",
            inventoryNumber = $"TRK-{Guid.NewGuid():N}".Substring(0, 12),
            type = "Tractor",
            fuelType = "Diesel"
        });
        var machineResult = await machineResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var machineId = machineResult.GetProperty("id").GetGuid();

        var response = await PostAsync($"/api/agro-operations/{opId}/machinery", new
        {
            agroOperationId = opId,
            machineId,
            hoursWorked = 8.0,
            fuelUsed = 40.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task DeleteAgroOperation_ReturnsNoContent()
    {
        var fieldId = await CreateFieldAsync("Delete Op Field");
        var opId = await CreateAgroOperationAsync(fieldId, "Delete Test Op");

        var response = await DeleteAsync($"/api/agro-operations/{opId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
