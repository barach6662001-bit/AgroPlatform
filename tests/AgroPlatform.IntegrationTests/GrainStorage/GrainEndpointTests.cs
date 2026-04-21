using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.GrainStorage;

public class GrainEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    private readonly ApiFactory _factory;
    private static readonly Guid TestTenantId = ApiFactory.TenantId;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public GrainEndpointTests(ApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", TestTenantId.ToString());
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private async Task<Guid> CreateStorageAsync(string name = "Test Silo", decimal? capacity = 1000m)
    {
        var response = await _client.PostAsJsonAsync("/api/grain-storages", new
        {
            name,
            code = name.Replace(" ", "-"),
            location = "Test",
            storageType = "Silo",
            capacityTons = capacity,
            isActive = true,
        }, JsonOptions);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        return result.GetProperty("id").GetGuid();
    }

    private async Task<Guid> CreateBatchAsync(Guid storageId, string grainType = "Wheat", decimal quantity = 100m)
    {
        var response = await _client.PostAsJsonAsync("/api/grain-batches", new
        {
            grainStorageId = storageId,
            grainType,
            initialQuantityTons = quantity,
            ownershipType = 0,
            receivedDate = DateTime.UtcNow.ToString("o"),
        }, JsonOptions);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        return result.GetProperty("id").GetGuid();
    }

    // ── Create Batch ──────────────────────────────────────────────────────

    [Fact]
    public async Task CreateBatch_ReturnsCreatedWithId()
    {
        var storageId = await CreateStorageAsync("Silo-Create");
        var batchId = await CreateBatchAsync(storageId, "Corn", 250m);
        batchId.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateBatch_BatchAppearsInGetBatches()
    {
        var storageId = await CreateStorageAsync("Silo-GetBatch");
        var batchId = await CreateBatchAsync(storageId, "Barley", 150m);

        var response = await _client.GetAsync($"/api/grain-batches?storageId={storageId}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        json.GetProperty("items").GetArrayLength().Should().BeGreaterThanOrEqualTo(1);
    }

    // ── Transfer ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Transfer_ReducesSourceAndIncreasesTarget()
    {
        var s1 = await CreateStorageAsync("Silo-Transfer-S");
        var s2 = await CreateStorageAsync("Silo-Transfer-T");
        var sourceId = await CreateBatchAsync(s1, "Wheat", 200m);
        var targetId = await CreateBatchAsync(s2, "Wheat", 50m);

        var transferResponse = await _client.PostAsJsonAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId = sourceId,
            targetBatchId = targetId,
            quantityTons = 80m,
        }, JsonOptions);
        transferResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var transferResult = await transferResponse.Content.ReadFromJsonAsync<JsonElement>();
        transferResult.GetProperty("operationId").GetGuid().Should().NotBeEmpty();

        // Verify quantities changed
        var batchesJson = await _client.GetAsync("/api/grain-batches?pageSize=100");
        var batches = await batchesJson.Content.ReadFromJsonAsync<JsonElement>();
        var items = batches.GetProperty("items");

        JsonElement? source = null, target = null;
        foreach (var item in items.EnumerateArray())
        {
            var id = item.GetProperty("id").GetGuid();
            if (id == sourceId) source = item;
            if (id == targetId) target = item;
        }

        source.Should().NotBeNull();
        target.Should().NotBeNull();
        source!.Value.GetProperty("quantityTons").GetDecimal().Should().Be(120m);
        target!.Value.GetProperty("quantityTons").GetDecimal().Should().Be(130m);
    }

    // ── Split ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Split_CreatesNewBatchAndReducesSource()
    {
        var s1 = await CreateStorageAsync("Silo-Split-S");
        var s2 = await CreateStorageAsync("Silo-Split-T");
        var sourceId = await CreateBatchAsync(s1, "Corn", 300m);

        var splitResponse = await _client.PostAsJsonAsync("/api/grain-batches/split", new
        {
            sourceBatchId = sourceId,
            splitQuantityTons = 100m,
            targetStorageId = s2,
        }, JsonOptions);
        splitResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var splitResult = await splitResponse.Content.ReadFromJsonAsync<JsonElement>();
        var newBatchId = splitResult.GetProperty("id").GetGuid();
        newBatchId.Should().NotBeEmpty();

        // Verify source reduced
        var batchesJson = await _client.GetAsync("/api/grain-batches?pageSize=100");
        var batches = await batchesJson.Content.ReadFromJsonAsync<JsonElement>();
        foreach (var item in batches.GetProperty("items").EnumerateArray())
        {
            if (item.GetProperty("id").GetGuid() == sourceId)
                item.GetProperty("quantityTons").GetDecimal().Should().Be(200m);
            if (item.GetProperty("id").GetGuid() == newBatchId)
                item.GetProperty("quantityTons").GetDecimal().Should().Be(100m);
        }
    }

    // ── Adjust ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Adjust_ChangesQuantity()
    {
        var s = await CreateStorageAsync("Silo-Adjust");
        var batchId = await CreateBatchAsync(s, "Wheat", 100m);

        var adjustResponse = await _client.PostAsJsonAsync($"/api/grain-batches/{batchId}/adjust", new
        {
            adjustmentTons = -15m,
            reason = "Shrinkage",
        }, JsonOptions);
        adjustResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var batchesJson = await _client.GetAsync("/api/grain-batches?pageSize=100");
        var batches = await batchesJson.Content.ReadFromJsonAsync<JsonElement>();
        foreach (var item in batches.GetProperty("items").EnumerateArray())
        {
            if (item.GetProperty("id").GetGuid() == batchId)
                item.GetProperty("quantityTons").GetDecimal().Should().Be(85m);
        }
    }

    // ── WriteOff ──────────────────────────────────────────────────────────

    [Fact]
    public async Task WriteOff_ReducesQuantity()
    {
        var s = await CreateStorageAsync("Silo-WriteOff");
        var batchId = await CreateBatchAsync(s, "Barley", 200m);

        var writeOffResponse = await _client.PostAsJsonAsync($"/api/grain-batches/{batchId}/writeoff", new
        {
            quantityTons = 50m,
            reason = "Spoilage",
        }, JsonOptions);
        writeOffResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var batchesJson = await _client.GetAsync("/api/grain-batches?pageSize=100");
        var batches = await batchesJson.Content.ReadFromJsonAsync<JsonElement>();
        foreach (var item in batches.GetProperty("items").EnumerateArray())
        {
            if (item.GetProperty("id").GetGuid() == batchId)
                item.GetProperty("quantityTons").GetDecimal().Should().Be(150m);
        }
    }

    // ── Ledger ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Ledger_ReturnsPaginatedMovements()
    {
        var s = await CreateStorageAsync("Silo-Ledger");
        await CreateBatchAsync(s, "Wheat", 100m); // Receipt movement created on batch creation

        var response = await _client.GetAsync("/api/grain-batches/ledger?pageSize=50");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        json.GetProperty("items").GetArrayLength().Should().BeGreaterThanOrEqualTo(1);
        json.GetProperty("totalCount").GetInt32().Should().BeGreaterThanOrEqualTo(1);
    }

    // ── Overview ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Overview_ReturnsStoragesWithOccupancy()
    {
        var s = await CreateStorageAsync("Silo-Overview", 500m);
        await CreateBatchAsync(s, "Wheat", 100m);

        var response = await _client.GetAsync($"/api/grain-storages/overview?storageId={s}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        json.GetArrayLength().Should().BeGreaterThanOrEqualTo(1);

        var storage = json[0];
        storage.GetProperty("occupiedTons").GetDecimal().Should().BeGreaterThanOrEqualTo(100m);
        storage.GetProperty("batchCount").GetInt32().Should().BeGreaterThanOrEqualTo(1);
    }

    // ── Validation ────────────────────────────────────────────────────────

    [Fact]
    public async Task Transfer_ZeroQuantity_Returns400()
    {
        var s1 = await CreateStorageAsync("Silo-Val-S");
        var s2 = await CreateStorageAsync("Silo-Val-T");
        var sourceId = await CreateBatchAsync(s1, "Wheat", 100m);
        var targetId = await CreateBatchAsync(s2, "Wheat", 50m);

        var response = await _client.PostAsJsonAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId = sourceId,
            targetBatchId = targetId,
            quantityTons = 0m,
        }, JsonOptions);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task WriteOff_NegativeQuantity_Returns400()
    {
        var s = await CreateStorageAsync("Silo-Val-Wo");
        var batchId = await CreateBatchAsync(s, "Wheat", 100m);

        var response = await _client.PostAsJsonAsync($"/api/grain-batches/{batchId}/writeoff", new
        {
            quantityTons = -10m,
            reason = "test",
        }, JsonOptions);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
