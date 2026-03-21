using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests.Machinery;

[Collection("Integration Tests")]
public class GpsTrackControllerTests : IntegrationTestBase
{
    public GpsTrackControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateMachineAsync(string name = "GPS Test Tractor", string? imei = null)
    {
        var response = await PostAsync("/api/machinery", new
        {
            name,
            inventoryNumber = $"GPS-{Guid.NewGuid():N}"[..12],
            type = "Tractor",
            brand = "John Deere",
            model = "8R 410",
            year = 2022,
            fuelType = "Diesel",
            fuelConsumptionPerHour = 15.0
        });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var machineId = result.GetProperty("id").GetGuid();

        if (imei != null)
        {
            // Directly update IMEI via database to avoid any API restriction
            using var scope = CreateScope();
            var db = GetDbContext(scope);
            var machine = db.Machines.Find(machineId);
            machine!.ImeiNumber = imei;
            await db.SaveChangesAsync();
        }

        return machineId;
    }

    private async Task InsertGpsTracksAsync(Guid machineId, IEnumerable<(double lat, double lng, decimal speed, decimal fuelLevel, DateTime timestamp)> tracks)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        foreach (var (lat, lng, speed, fuelLevel, timestamp) in tracks)
        {
            db.GpsTracks.Add(new GpsTrack
            {
                VehicleId = machineId,
                Lat = lat,
                Lng = lng,
                Speed = speed,
                FuelLevel = fuelLevel,
                Timestamp = timestamp,
                TenantId = TenantId
            });
        }
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetTrack_ValidRange_ReturnsOrderedTrackPoints()
    {
        var machineId = await CreateMachineAsync("GetTrack Test");
        var baseTime = new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc);

        await InsertGpsTracksAsync(machineId, new[]
        {
            (50.1, 30.1, 10m, 80m, baseTime.AddMinutes(10)),
            (50.2, 30.2, 15m, 78m, baseTime.AddMinutes(5)),
            (50.3, 30.3, 20m, 76m, baseTime.AddMinutes(15)),
        });

        var from = Uri.EscapeDataString(baseTime.ToString("o"));
        var to = Uri.EscapeDataString(baseTime.AddHours(1).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{machineId}/track?from={from}&to={to}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement[]>(JsonOptions);
        result.Should().NotBeNull();
        result!.Should().HaveCount(3);
        // Verify ordering by timestamp (ascending)
        var timestamps = result.Select(r => r.GetProperty("timestamp").GetDateTime()).ToList();
        timestamps.Should().BeInAscendingOrder();
    }

    [Fact]
    public async Task GetTrack_NoTracksInRange_ReturnsEmptyList()
    {
        var machineId = await CreateMachineAsync("EmptyTrack Test");

        var from = Uri.EscapeDataString(new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var to = Uri.EscapeDataString(new DateTime(2026, 6, 2, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{machineId}/track?from={from}&to={to}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement[]>(JsonOptions);
        result.Should().NotBeNull();
        result!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetTrack_InvalidRange_FromAfterTo_ReturnsBadRequest()
    {
        var machineId = await CreateMachineAsync("BadRange Test");

        var from = Uri.EscapeDataString(new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var to = Uri.EscapeDataString(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{machineId}/track?from={from}&to={to}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTrack_MissingFromParameter_ReturnsBadRequest()
    {
        var machineId = await CreateMachineAsync("MissingFrom Test");
        var to = Uri.EscapeDataString(new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{machineId}/track?to={to}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTrack_MissingToParameter_ReturnsBadRequest()
    {
        var machineId = await CreateMachineAsync("MissingTo Test");
        var from = Uri.EscapeDataString(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{machineId}/track?from={from}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTrack_NonExistentMachine_ReturnsNotFound()
    {
        var nonExistentId = Guid.NewGuid();
        var from = Uri.EscapeDataString(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var to = Uri.EscapeDataString(new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc).ToString("o"));
        var response = await Client.GetAsync($"/api/machinery/{nonExistentId}/track?from={from}&to={to}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── Teltonika webhook tests ──────────────────────────────────────────────

    /// <summary>
    /// Posting to the Teltonika webhook without an X-Tenant-Id header must NOT be
    /// blocked by the tenant middleware (TenantMiddleware exempts this path).
    /// </summary>
    [Fact]
    public async Task TeltonikaWebhook_WithoutTenantHeader_IsNotBlocked()
    {
        // Create a client that has NO X-Tenant-Id header
        var anonClient = Factory.CreateClient();

        var payload = new
        {
            imei = "123456789012345",   // numeric 15-digit IMEI
            lat = 50.1,
            lng = 30.2,
            speed = 0.0,
            fuelLevel = 50.0,
            timestampUtc = DateTime.UtcNow
        };

        var response = await anonClient.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        // Must not be 400 "Missing Tenant Header"
        response.StatusCode.Should().NotBe(HttpStatusCode.BadRequest);
        // Unknown IMEI → 200 OK with Guid.Empty
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        body.GetProperty("id").GetGuid().Should().Be(Guid.Empty);
    }

    /// <summary>
    /// When a machine with the matching IMEI exists, the webhook should persist
    /// a GPS track and return a non-empty Guid.
    /// </summary>
    [Fact]
    public async Task TeltonikaWebhook_KnownImei_PersistsTrackAndReturnsId()
    {
        // Use a unique 15-digit numeric IMEI for this test run
        var imei = "100000000000001";
        var machineId = await CreateMachineAsync("Webhook Tractor", imei);

        // Post without tenant header — the handler resolves machine via IgnoreQueryFilters
        var anonClient = Factory.CreateClient();

        var payload = new
        {
            imei,
            lat = 49.5,
            lng = 31.0,
            speed = 12.5,
            fuelLevel = 75.0,
            timestampUtc = new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc)
        };

        var response = await anonClient.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var trackId = body.GetProperty("id").GetGuid();
        trackId.Should().NotBe(Guid.Empty);

        // Verify the track was actually persisted in the DB
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var track = db.GpsTracks.IgnoreQueryFilters().FirstOrDefault(t => t.Id == trackId);
        track.Should().NotBeNull();
        track!.VehicleId.Should().Be(machineId);
        track.TenantId.Should().Be(TenantId);
    }

    /// <summary>
    /// An unknown IMEI must return 200 OK with Guid.Empty and must not persist any track.
    /// </summary>
    [Fact]
    public async Task TeltonikaWebhook_UnknownImei_ReturnsGuidEmptyAndDoesNotPersist()
    {
        var anonClient = Factory.CreateClient();

        var payload = new
        {
            imei = "999999999999999",   // numeric 15-digit IMEI that is not registered
            lat = 50.0,
            lng = 30.0,
            speed = 5.0,
            fuelLevel = 40.0,
            timestampUtc = DateTime.UtcNow
        };

        var response = await anonClient.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        body.GetProperty("id").GetGuid().Should().Be(Guid.Empty);
    }
}

