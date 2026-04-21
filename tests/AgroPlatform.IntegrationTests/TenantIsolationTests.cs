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

    // ── TenantAuthorizationMiddleware tests ─────────────────────────────────

    /// <summary>
    /// A non-admin user whose JWT TenantId is Tenant A must receive 403 Forbidden when
    /// they pass <c>X-Tenant-Id: TenantB</c> in the header — i.e. they cannot spoof
    /// access to another farm's data.
    /// </summary>
    [Fact]
    public async Task NonAdminUser_CannotAccessOtherTenant_Via_XTenantIdHeader_ReturnsForbidden()
    {
        // Arrange: create a client that authenticates as a non-admin user belonging to Tenant A
        // but sends X-Tenant-Id pointing at Tenant B.
        var nonAdminTenantBClient = Factory.CreateClient();
        nonAdminTenantBClient.DefaultRequestHeaders.Add("X-Tenant-Id", TenantBId.ToString());
        nonAdminTenantBClient.DefaultRequestHeaders.Add("X-Test-Role", "Operator");
        nonAdminTenantBClient.DefaultRequestHeaders.Add("X-Test-Tenant-Id", TenantId.ToString());

        // Act: attempt to read warehouses (or any tenant-scoped endpoint)
        var response = await nonAdminTenantBClient.GetAsync("/api/warehouses");

        // Assert: middleware must reject the cross-tenant request
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    /// <summary>
    /// A SuperAdmin user IS allowed to use any X-Tenant-Id header value so they can manage
    /// multiple farms without being blocked by TenantAuthorizationMiddleware.
    /// </summary>
    [Fact]
    public async Task SuperAdminUser_CanAccessAnyTenant_Via_XTenantIdHeader()
    {
        // Arrange: SuperAdmin user whose JWT TenantId is Tenant A but uses Tenant B header.
        // Phase 0: only SuperAdmin bypasses the tenant cross-check in TenantAuthorizationMiddleware.
        var superAdminClientB = Factory.CreateClient();
        superAdminClientB.DefaultRequestHeaders.Add("X-Tenant-Id", TenantBId.ToString());
        superAdminClientB.DefaultRequestHeaders.Add("X-Test-Role", "SuperAdmin");

        // Act: SuperAdmin reads Tenant B warehouses — should succeed (no data, but 200 OK)
        var response = await superAdminClientB.GetAsync("/api/warehouses");

        // Assert: SuperAdmin request is not blocked
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
