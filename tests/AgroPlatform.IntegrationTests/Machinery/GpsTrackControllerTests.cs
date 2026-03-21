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

    private async Task<Guid> InsertMachineWithImeiAsync(string imei)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var machine = new Machine
        {
            Name = $"IMEI Machine {imei}",
            InventoryNumber = $"IMEI-{imei[..8]}",
            Type = Domain.Enums.MachineryType.Tractor,
            FuelType = Domain.Enums.FuelType.Diesel,
            ImeiNumber = imei,
            TenantId = TenantId
        };
        db.Machines.Add(machine);
        await db.SaveChangesAsync();
        return machine.Id;
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

    [Fact]
    public async Task TeltonikaWebhook_KnownImei_PersistsTrackAndReturnsId()
    {
        var imei = $"8{Guid.NewGuid():N}"[..15];
        var machineId = await InsertMachineWithImeiAsync(imei);

        var payload = new
        {
            imei,
            latitude = 49.5,
            longitude = 31.2,
            speed = 12.5m,
            fuelLevel = 60.0m,
            timestampUtc = new DateTime(2026, 3, 21, 10, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var trackId = result.GetProperty("id").GetGuid();
        trackId.Should().NotBe(Guid.Empty);

        // Verify GpsTrack row exists in DB
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var track = await db.GpsTracks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.Id == trackId);
        track.Should().NotBeNull();
        track!.VehicleId.Should().Be(machineId);
    }

    [Fact]
    public async Task TeltonikaWebhook_UnknownImei_ReturnsGuidEmptyAndNoPersistence()
    {
        var unknownImei = "999999999999999";

        // Count tracks before
        using var scopeBefore = CreateScope();
        var dbBefore = GetDbContext(scopeBefore);
        var countBefore = await dbBefore.GpsTracks.IgnoreQueryFilters().CountAsync();

        var payload = new
        {
            imei = unknownImei,
            latitude = 49.5,
            longitude = 31.2,
            speed = 5.0m,
            fuelLevel = 40.0m,
            timestampUtc = new DateTime(2026, 3, 21, 11, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var trackId = result.GetProperty("id").GetGuid();
        trackId.Should().Be(Guid.Empty);

        // Verify no GpsTrack row was created
        using var scopeAfter = CreateScope();
        var dbAfter = GetDbContext(scopeAfter);
        var countAfter = await dbAfter.GpsTracks.IgnoreQueryFilters().CountAsync();
        countAfter.Should().Be(countBefore);
    }

    [Fact]
    public async Task TeltonikaWebhook_InvalidImei_ReturnsBadRequest()
    {
        var payload = new
        {
            imei = "not-an-imei",
            latitude = 49.5,
            longitude = 31.2,
            speed = 0m,
            fuelLevel = 50m,
            timestampUtc = new DateTime(2026, 3, 21, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook/teltonika", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
