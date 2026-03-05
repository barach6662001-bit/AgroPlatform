using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Warehouses;

[Collection("Integration Tests")]
public class WarehousesControllerTests : IntegrationTestBase
{
    public WarehousesControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateWarehouseAsync(string name = "Test Warehouse")
    {
        var response = await PostAsync("/api/warehouses", new { name, location = "Test Location" });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    private async Task<Guid> CreateItemAsync(string code)
    {
        var response = await PostAsync("/api/warehouses/items", new
        {
            name = $"Item {code}",
            code,
            category = "Grain",
            baseUnit = "kg"
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateWarehouse_ReturnsCreated_WithId()
    {
        var response = await PostAsync("/api/warehouses", new { name = "New Warehouse", location = "Location A" });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetWarehouses_ReturnsOk_WithList()
    {
        await CreateWarehouseAsync("List Test Warehouse");

        var result = await GetAsync<JsonElement[]>("/api/warehouses");

        result.Should().NotBeNull();
        result!.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ReceiptStock_ReturnsCreated()
    {
        var warehouseId = await CreateWarehouseAsync("Receipt Warehouse");
        var itemId = await CreateItemAsync("RCPT-001");

        var response = await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 50.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task IssueStock_WithSufficientBalance_ReturnsCreated()
    {
        var warehouseId = await CreateWarehouseAsync("Issue Warehouse");
        var itemId = await CreateItemAsync("ISSUE-001");

        await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 100.0,
            unitCode = "kg"
        });

        var response = await PostAsync("/api/warehouses/issue", new
        {
            warehouseId,
            itemId,
            quantity = 40.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task IssueStock_WithInsufficientBalance_ReturnsConflictOrUnprocessable()
    {
        var warehouseId = await CreateWarehouseAsync("Insuf Warehouse");
        var itemId = await CreateItemAsync("INSUF-001");

        var response = await PostAsync("/api/warehouses/issue", new
        {
            warehouseId,
            itemId,
            quantity = 999.0,
            unitCode = "kg"
        });

        ((int)response.StatusCode).Should().BeInRange(400, 499);
    }

    [Fact]
    public async Task IssueStock_WithInsufficientBalance_Returns422_WithProblemBody()
    {
        var warehouseId = await CreateWarehouseAsync("Insuf422 Warehouse");
        var itemId = await CreateItemAsync("INSUF422-001");

        var response = await PostAsync("/api/warehouses/issue", new
        {
            warehouseId,
            itemId,
            quantity = 9999.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        body.GetProperty("status").GetInt32().Should().Be(422);
        body.GetProperty("title").GetString().Should().Be("Insufficient Balance");
        body.GetProperty("detail").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task IssueStock_WithNonExistentWarehouse_Returns404_WithProblemBody()
    {
        var nonExistentWarehouseId = Guid.NewGuid();
        var itemId = await CreateItemAsync($"NE-ITEM-{Guid.NewGuid():N}"[..14]);

        var response = await PostAsync("/api/warehouses/issue", new
        {
            warehouseId = nonExistentWarehouseId,
            itemId,
            quantity = 10.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        body.GetProperty("status").GetInt32().Should().Be(404);
        body.GetProperty("title").GetString().Should().Be("Not Found");
    }

    [Fact]
    public async Task CreateWarehouseItem_WithDuplicateCode_Returns409_WithProblemBody()
    {
        var code = $"DUP-{Guid.NewGuid():N}"[..12];
        await CreateItemAsync(code);

        var response = await PostAsync("/api/warehouses/items", new
        {
            name = "Duplicate Item",
            code,
            category = "Grain",
            baseUnit = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        body.GetProperty("status").GetInt32().Should().Be(409);
        body.GetProperty("title").GetString().Should().Be("Conflict");
        body.GetProperty("detail").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task TransferStock_ReturnsOk()
    {
        var sourceId = await CreateWarehouseAsync("Source Warehouse");
        var destId = await CreateWarehouseAsync("Destination Warehouse");
        var itemId = await CreateItemAsync("XFER-001");

        await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId = sourceId,
            itemId,
            quantity = 200.0,
            unitCode = "kg"
        });

        var response = await PostAsync("/api/warehouses/transfer", new
        {
            sourceWarehouseId = sourceId,
            destinationWarehouseId = destId,
            itemId,
            quantity = 100.0,
            unitCode = "kg"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetBalances_AfterReceipt_ReturnsCorrectBalance()
    {
        var warehouseId = await CreateWarehouseAsync("Balance Warehouse");
        var itemId = await CreateItemAsync("BAL-001");

        await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 75.0,
            unitCode = "kg"
        });

        var balances = await GetAsync<JsonElement[]>($"/api/warehouses/balances?warehouseId={warehouseId}&itemId={itemId}");

        balances.Should().NotBeNull();
        balances!.Should().HaveCount(1);
        balances![0].GetProperty("balanceBase").GetDecimal().Should().Be(75m);
    }

    [Fact]
    public async Task GetMoveHistory_ReturnsPagedResults()
    {
        var warehouseId = await CreateWarehouseAsync("History Warehouse");
        var itemId = await CreateItemAsync("HIST-001");

        await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 100.0,
            unitCode = "kg"
        });
        await PostAsync("/api/warehouses/issue", new
        {
            warehouseId,
            itemId,
            quantity = 20.0,
            unitCode = "kg"
        });

        var moves = await GetAsync<JsonElement[]>($"/api/warehouses/moves?warehouseId={warehouseId}&itemId={itemId}");

        moves.Should().NotBeNull();
        moves!.Length.Should().Be(2);
    }
}
