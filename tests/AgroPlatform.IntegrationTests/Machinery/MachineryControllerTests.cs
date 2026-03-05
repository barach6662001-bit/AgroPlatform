using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Machinery;

[Collection("Integration Tests")]
public class MachineryControllerTests : IntegrationTestBase
{
    public MachineryControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateMachineAsync(string name = "Test Tractor")
    {
        var response = await PostAsync("/api/machinery", new
        {
            name,
            inventoryNumber = $"INV-{Guid.NewGuid():N}".Substring(0, 12),
            type = "Tractor",
            brand = "John Deere",
            model = "8R 410",
            year = 2022,
            fuelType = "Diesel",
            fuelConsumptionPerHour = 15.0
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateMachine_ReturnsCreated()
    {
        var response = await PostAsync("/api/machinery", new
        {
            name = "New Tractor",
            inventoryNumber = $"NEW-{Guid.NewGuid():N}".Substring(0, 12),
            type = "Tractor",
            fuelType = "Diesel"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetMachines_ReturnsOk()
    {
        await CreateMachineAsync("GetMachines Tractor");

        var result = await GetAsync<JsonElement[]>("/api/machinery");

        result.Should().NotBeNull();
        result!.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetMachineById_ReturnsDetail()
    {
        var machineId = await CreateMachineAsync("GetById Tractor");

        var result = await GetAsync<JsonElement>($"/api/machinery/{machineId}");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("id").GetGuid().Should().Be(machineId);
    }

    [Fact]
    public async Task UpdateMachine_ReturnsNoContent()
    {
        var machineId = await CreateMachineAsync("Update Test Tractor");

        var response = await PutAsync($"/api/machinery/{machineId}", new
        {
            id = machineId,
            name = "Updated Tractor",
            brand = "Claas",
            model = "Axion 870",
            year = 2023,
            status = "Active",
            fuelType = "Diesel",
            fuelConsumptionPerHour = 18.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteMachine_ReturnsNoContent()
    {
        var machineId = await CreateMachineAsync("Delete Test Tractor");

        var response = await DeleteAsync($"/api/machinery/{machineId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task AddWorkLog_ReturnsCreated()
    {
        var machineId = await CreateMachineAsync("WorkLog Tractor");

        var response = await PostAsync($"/api/machinery/{machineId}/work-logs", new
        {
            machineId,
            date = DateTime.UtcNow.Date.ToString("o"),
            hoursWorked = 8.5,
            description = "Field plowing"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task AddFuelLog_ReturnsCreated()
    {
        var machineId = await CreateMachineAsync("FuelLog Tractor");

        var response = await PostAsync($"/api/machinery/{machineId}/fuel-logs", new
        {
            machineId,
            date = DateTime.UtcNow.Date.ToString("o"),
            quantity = 120.0,
            fuelType = "Diesel",
            note = "Refueling"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetSummary_ReturnsOk()
    {
        var response = await Client.GetAsync("/api/machinery/summary");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
