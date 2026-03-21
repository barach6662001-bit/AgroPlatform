using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests.Machinery;

[Collection("Integration Tests")]
public class GpsTrackControllerTests : IntegrationTestBase
{
    public GpsTrackControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateMachineAsync(string name = "GPS Test Tractor")
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
        return result.GetProperty("id").GetGuid();
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

    // ── Teltonika webhook ────────────────────────────────────────────────────────

    [Fact]
    public async Task TeltonikaWebhook_UnknownImei_ReturnsOkWithEmptyId()
    {
        var payload = new
        {
            imei = "000000000000001",
            lat = 50.45,
            lng = 30.52,
            speed = 42m,
            timestamp = new DateTime(2026, 3, 21, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().BeEmpty();
    }

    [Fact]
    public async Task TeltonikaWebhook_KnownImei_StoresTrackWithVehicleId()
    {
        // Arrange: create a machine and assign an IMEI
        var machineId = await CreateMachineAsync("Teltonika IMEI Test");
        var imei = $"35{Guid.NewGuid():N}"[..15];

        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);
            var machine = await db.Machines.FindAsync(machineId);
            machine!.ImeiNumber = imei;
            await db.SaveChangesAsync();
        }

        var payload = new
        {
            imei,
            lat = 49.0,
            lng = 31.5,
            speed = 25m,
            timestamp = new DateTime(2026, 3, 21, 14, 0, 0, DateTimeKind.Utc)
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var trackId = result.GetProperty("id").GetGuid();
        trackId.Should().NotBeEmpty();

        using var verifyScope = CreateScope();
        var verifyDb = GetDbContext(verifyScope);
        var track = await verifyDb.GpsTracks.FindAsync(trackId);
        track.Should().NotBeNull();
        track!.VehicleId.Should().Be(machineId);
        track.Lat.Should().BeApproximately(49.0, 0.001);
        track.Lng.Should().BeApproximately(31.5, 0.001);
    }
}
