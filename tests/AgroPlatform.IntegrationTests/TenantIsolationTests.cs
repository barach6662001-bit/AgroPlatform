using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Domain.Users;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests;

[Collection("Integration Tests")]
public class TenantIsolationTests : IntegrationTestBase
{
    private static readonly Guid TenantBId = new Guid("00000000-0000-0000-0000-000000000099");

    public TenantIsolationTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
        EnsureTenantBExists();
    }

    private void EnsureTenantBExists()
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        if (!db.Tenants.Any(t => t.Id == TenantBId))
        {
            db.Tenants.Add(new Tenant { Id = TenantBId, Name = "Tenant B", IsActive = true });
            db.SaveChanges();
        }
    }

    private HttpClient CreateTenantBClient()
    {
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantBId.ToString());
        return client;
    }

    [Fact]
    public async Task WarehouseCreatedForTenantA_IsNotVisibleToTenantB()
    {
        // Arrange: create a warehouse under Tenant A
        var createResponse = await PostAsync("/api/warehouses", new
        {
            name = "TenantA Exclusive Warehouse",
            location = "Location A"
        });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await createResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var warehouseId = result.GetProperty("id").GetGuid();

        // Act: query warehouses under Tenant B
        var clientB = CreateTenantBClient();
        var responseB = await clientB.GetAsync("/api/warehouses");

        // Assert: Tenant B cannot see Tenant A's warehouse
        responseB.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await responseB.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        payload.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        var warehousesB = payload.GetProperty("items").EnumerateArray().ToList();
        warehousesB.Should().NotContain(w => w.GetProperty("id").GetGuid() == warehouseId);
    }

    [Fact]
    public async Task ItemCodeCreatedForTenantA_AllowsSameCodeCreationForTenantB()
    {
        // Arrange: create a warehouse item under Tenant A with a unique code
        var sharedCode = $"ISO-{Guid.NewGuid():N}"[..12];
        var createResponseA = await PostAsync("/api/warehouses/items", new
        {
            name = "TenantA Item",
            code = sharedCode,
            category = "Grain",
            baseUnit = "kg"
        });
        createResponseA.StatusCode.Should().Be(HttpStatusCode.Created);

        // Act: Tenant B creates an item with the same code
        var clientB = CreateTenantBClient();
        var createResponseB = await clientB.PostAsJsonAsync("/api/warehouses/items", new
        {
            name = "TenantB Item Same Code",
            code = sharedCode,
            category = "Grain",
            baseUnit = "kg"
        }, JsonOptions);

        // Assert: Tenant B can create the same code (no conflict across tenant boundary)
        createResponseB.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task StockBalanceCreatedForTenantA_IsNotVisibleToTenantB()
    {
        // Arrange: create a warehouse and item under Tenant A, then receipt stock
        var warehouseResponse = await PostAsync("/api/warehouses", new
        {
            name = $"TenantA Balance Warehouse {Guid.NewGuid():N}"[..30],
            location = "Location A"
        });
        warehouseResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var warehouseResult = await warehouseResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var warehouseId = warehouseResult.GetProperty("id").GetGuid();

        var itemCode = $"BAL-{Guid.NewGuid():N}"[..12];
        var itemResponse = await PostAsync("/api/warehouses/items", new
        {
            name = "TenantA Balance Item",
            code = itemCode,
            category = "Grain",
            baseUnit = "kg"
        });
        itemResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var itemResult = await itemResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var itemId = itemResult.GetProperty("id").GetGuid();

        var receiptResponse = await PostAsync("/api/warehouses/receipt", new
        {
            warehouseId,
            itemId,
            quantity = 100m,
            unitCode = "kg"
        });
        receiptResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // Act: query balances under Tenant B
        var clientB = CreateTenantBClient();
        var responseBBalances = await clientB.GetAsync("/api/warehouses/balances");

        // Assert: Tenant B cannot see Tenant A's stock balance
        responseBBalances.StatusCode.Should().Be(HttpStatusCode.OK);
        var balancesPayload = await responseBBalances.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        balancesPayload.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        var balancesB = balancesPayload.GetProperty("items").EnumerateArray().ToList();
        balancesB.Should().NotContain(b => b.GetProperty("warehouseId").GetGuid() == warehouseId);
    }
}
