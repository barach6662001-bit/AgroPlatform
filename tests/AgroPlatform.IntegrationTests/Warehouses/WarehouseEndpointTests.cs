using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Warehouses;

public class WarehouseEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    private static readonly Guid TestTenantId = Guid.NewGuid();

    public WarehouseEndpointTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", TestTenantId.ToString());
    }

    [Fact]
    public async Task FullWarehouseFlow_CreateReceiptIssueShouldUpdateBalance()
    {
        // 1. Create warehouse
        var createWarehouseResponse = await _client.PostAsJsonAsync("/api/warehouses", new
        {
            name = "Test Warehouse",
            location = "Test Location"
        });
        createWarehouseResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var warehouseResult = await createWarehouseResponse.Content.ReadFromJsonAsync<JsonElement>();
        var warehouseId = warehouseResult.GetProperty("id").GetGuid();

        // 2. Create item
        var createItemResponse = await _client.PostAsJsonAsync("/api/warehouses/items", new
        {
            name = "Wheat",
            code = "WHT-INT-001",
            category = "Grain",
            baseUnit = "kg"
        });
        createItemResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var itemResult = await createItemResponse.Content.ReadFromJsonAsync<JsonElement>();
        var itemId = itemResult.GetProperty("id").GetGuid();

        // 3. Receipt stock
        var receiptResponse = await _client.PostAsJsonAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 100.0,
            unitCode = "kg"
        });
        receiptResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // 4. Check balance
        var balanceResponse = await _client.GetAsync($"/api/warehouses/balances?warehouseId={warehouseId}&itemId={itemId}");
        balanceResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var balances = await balanceResponse.Content.ReadFromJsonAsync<JsonElement[]>();
        balances.Should().NotBeNull();
        balances!.Length.Should().Be(1);
        balances[0].GetProperty("balanceBase").GetDecimal().Should().Be(100m);

        // 5. Issue stock
        var issueResponse = await _client.PostAsJsonAsync("/api/warehouses/issue", new
        {
            warehouseId,
            itemId,
            quantity = 30.0,
            unitCode = "kg"
        });
        issueResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // 6. Check balance after issue
        var balanceAfterIssueResponse = await _client.GetAsync($"/api/warehouses/balances?warehouseId={warehouseId}&itemId={itemId}");
        var balancesAfterIssue = await balanceAfterIssueResponse.Content.ReadFromJsonAsync<JsonElement[]>();
        balancesAfterIssue![0].GetProperty("balanceBase").GetDecimal().Should().Be(70m);
    }

    [Fact]
    public async Task GetWarehouses_ReturnsList()
    {
        var response = await _client.GetAsync("/api/warehouses");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task MissingTenantHeader_ReturnsBadRequest()
    {
        var clientWithoutTenant = new HttpClient { BaseAddress = _client.BaseAddress };
        var response = await clientWithoutTenant.GetAsync("/api/warehouses");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
