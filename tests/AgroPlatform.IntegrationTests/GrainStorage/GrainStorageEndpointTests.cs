using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.GrainStorage;

[Collection("Integration Tests")]
public class GrainStorageEndpointTests : IntegrationTestBase
{
    public GrainStorageEndpointTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateStorageAsync(string name = "Test Storage")
    {
        var response = await PostAsync("/api/grain-storages", new
        {
            name,
            code = $"GS-{Guid.NewGuid():N}"[..10],
            location = "Test Location",
            storageType = "Elevator",
            capacityTons = 5000m,
            isActive = true,
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    private async Task<Guid> CreateBatchAsync(Guid storageId, string grainType = "Wheat", decimal quantity = 100m)
    {
        var response = await PostAsync("/api/grain-batches", new
        {
            grainStorageId = storageId,
            grainType,
            initialQuantityTons = quantity,
            ownershipType = 0,
            receivedDate = DateTime.UtcNow.ToString("o"),
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }

    // ── Grain Storages CRUD ──────────────────────────────────────────

    [Fact]
    public async Task CreateGrainStorage_ReturnsCreated_WithId()
    {
        var response = await PostAsync("/api/grain-storages", new
        {
            name = "New Storage",
            code = "NS-001",
            location = "Location A",
            storageType = "Flat",
            capacityTons = 3000m,
            isActive = true,
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetGrainStorages_ReturnsOk_WithList()
    {
        await CreateStorageAsync("List Storage");

        var result = await GetAsync<JsonElement>("/api/grain-storages");

        result.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        result.GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetGrainStorageOverview_ReturnsOk_WithOccupancyData()
    {
        var storageId = await CreateStorageAsync("Overview Storage");
        await CreateBatchAsync(storageId, "Wheat", 200m);

        var result = await GetAsync<JsonElement>("/api/grain-storages/overview");

        result.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        result.GetArrayLength().Should().BeGreaterThan(0);
    }

    // ── Grain Batches ──────────────────────────────────────────────

    [Fact]
    public async Task CreateGrainBatch_ReturnsCreated()
    {
        var storageId = await CreateStorageAsync("Batch Storage");

        var response = await PostAsync("/api/grain-batches", new
        {
            grainStorageId = storageId,
            grainType = "Barley",
            initialQuantityTons = 50m,
            ownershipType = 0,
            receivedDate = DateTime.UtcNow.ToString("o"),
            moisturePercent = 13.5m,
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetGrainBatches_ReturnsOk()
    {
        var storageId = await CreateStorageAsync("Batches List Storage");
        await CreateBatchAsync(storageId);

        var result = await GetAsync<JsonElement>("/api/grain-batches");

        result.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        result.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    // ── Transfer ──────────────────────────────────────────────────

    [Fact]
    public async Task TransferGrain_ValidTransfer_ReturnsOk()
    {
        var storageA = await CreateStorageAsync("Transfer Source");
        var storageB = await CreateStorageAsync("Transfer Target");
        var sourceBatchId = await CreateBatchAsync(storageA, "Wheat", 200m);
        var targetBatchId = await CreateBatchAsync(storageB, "Wheat", 50m);

        var response = await PostAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId,
            targetBatchId,
            quantityTons = 80m,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task TransferGrain_InsufficientQuantity_ReturnsError()
    {
        var storageA = await CreateStorageAsync("Insuf Transfer Source");
        var storageB = await CreateStorageAsync("Insuf Transfer Target");
        var sourceBatchId = await CreateBatchAsync(storageA, "Wheat", 10m);
        var targetBatchId = await CreateBatchAsync(storageB, "Wheat", 50m);

        var response = await PostAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId,
            targetBatchId,
            quantityTons = 999m,
        });

        ((int)response.StatusCode).Should().BeInRange(400, 499);
    }

    // ── Split ──────────────────────────────────────────────────────

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_ReturnsOk()
    {
        var storageA = await CreateStorageAsync("Split Source");
        var storageB = await CreateStorageAsync("Split Target");
        var batchId = await CreateBatchAsync(storageA, "Sunflower", 300m);

        var response = await PostAsync("/api/grain-batches/split", new
        {
            sourceBatchId = batchId,
            splitQuantityTons = 100m,
            targetStorageId = storageB,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── Adjust ──────────────────────────────────────────────────────

    [Fact]
    public async Task AdjustGrainBatch_PositiveAdjustment_ReturnsOk()
    {
        var storageId = await CreateStorageAsync("Adjust Storage");
        var batchId = await CreateBatchAsync(storageId, "Corn", 100m);

        var response = await PostAsync($"/api/grain-batches/{batchId}/adjust", new
        {
            batchId,
            adjustmentTons = 10m,
            reason = "Inventory recount",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── WriteOff ──────────────────────────────────────────────────

    [Fact]
    public async Task WriteOffGrainBatch_ValidWriteOff_ReturnsOk()
    {
        var storageId = await CreateStorageAsync("WriteOff Storage");
        var batchId = await CreateBatchAsync(storageId, "Rapeseed", 100m);

        var response = await PostAsync($"/api/grain-batches/{batchId}/writeoff", new
        {
            batchId,
            quantityTons = 5m,
            reason = "Spoilage",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── Ledger ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetGrainLedger_ReturnsOk()
    {
        var storageId = await CreateStorageAsync("Ledger Storage");
        await CreateBatchAsync(storageId, "Wheat", 100m);

        var result = await GetAsync<JsonElement>("/api/grain-batches/ledger");

        result.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        result.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    // ── Summary ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetGrainSummary_ReturnsOk()
    {
        var storageId = await CreateStorageAsync("Summary Storage");
        await CreateBatchAsync(storageId, "Wheat", 100m);

        var result = await GetAsync<JsonElement>("/api/grain-batches/summary");

        result.ValueKind.Should().NotBe(JsonValueKind.Undefined);
    }

    // ── Validation ──────────────────────────────────────────────────

    [Fact]
    public async Task TransferGrain_ZeroQuantity_Returns400()
    {
        var response = await PostAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId = Guid.NewGuid(),
            targetBatchId = Guid.NewGuid(),
            quantityTons = 0m,
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task TransferGrain_SameSourceAndTarget_Returns400()
    {
        var batchId = Guid.NewGuid();
        var response = await PostAsync("/api/grain-batches/transfer", new
        {
            sourceBatchId = batchId,
            targetBatchId = batchId,
            quantityTons = 10m,
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task WriteOffGrainBatch_ZeroQuantity_Returns400()
    {
        var batchId = Guid.NewGuid();
        var response = await PostAsync($"/api/grain-batches/{batchId}/writeoff", new
        {
            batchId,
            quantityTons = 0m,
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
