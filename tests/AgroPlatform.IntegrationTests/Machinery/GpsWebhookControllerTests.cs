using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests.Machinery;

[Collection("Integration Tests")]
public class GpsWebhookControllerTests : IntegrationTestBase
{
    public GpsWebhookControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> InsertMachineWithImeiAsync(string imei)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var machine = new Machine
        {
            Name = $"Webhook Machine {imei}",
            InventoryNumber = $"WH-{imei[..8]}",
            Type = Domain.Enums.MachineryType.Tractor,
            FuelType = Domain.Enums.FuelType.Diesel,
            ImeiNumber = imei,
            TenantId = TenantId
        };
        db.Machines.Add(machine);
        await db.SaveChangesAsync();
        return machine.Id;
    }

    [Fact]
    public async Task Webhook_KnownDevice_PersistsTrackBroadcastsAndReturnsAccepted()
    {
        var random = new Random();
        var imei = string.Concat(Enumerable.Range(0, 15).Select(_ => random.Next(0, 10).ToString()));
        var machineId = await InsertMachineWithImeiAsync(imei);

        var payload = new
        {
            deviceId = imei,
            lat = 49.5,
            lon = 31.2,
            speed = 12.5m,
            timestamp = new DateTime(2026, 3, 22, 10, 0, 0, DateTimeKind.Utc),
            fuel = 55.0m,
            heading = 90.0
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Accepted);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var trackId = result.GetProperty("id").GetGuid();
        trackId.Should().NotBe(Guid.Empty);

        // Verify GpsTrack was persisted to the database
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var track = await db.GpsTracks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.Id == trackId);
        track.Should().NotBeNull();
        track!.VehicleId.Should().Be(machineId);
        track.Lat.Should().BeApproximately(49.5, 0.0001);
        track.Lng.Should().BeApproximately(31.2, 0.0001);
    }

    [Fact]
    public async Task Webhook_KnownDevice_WithoutOptionalFields_Succeeds()
    {
        var random = new Random();
        var imei = string.Concat(Enumerable.Range(0, 15).Select(_ => random.Next(0, 10).ToString()));
        await InsertMachineWithImeiAsync(imei);

        var payload = new
        {
            deviceId = imei,
            lat = 50.0,
            lon = 30.0,
            speed = 0m,
            timestamp = new DateTime(2026, 3, 22, 11, 0, 0, DateTimeKind.Utc)
            // fuel and heading are omitted
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Accepted);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Webhook_UnknownDevice_ReturnsAcceptedWithGuidEmpty()
    {
        var unknownImei = "111111111111111";

        var payload = new
        {
            deviceId = unknownImei,
            lat = 49.5,
            lon = 31.2,
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.Accepted);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().Be(Guid.Empty);
    }

    [Fact]
    public async Task Webhook_MissingDeviceId_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "",
            lat = 49.5,
            lon = 31.2,
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_InvalidLatitude_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 91.0,  // invalid: > 90
            lon = 31.2,
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_InvalidLongitude_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 49.5,
            lon = -181.0,  // invalid: < -180
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_NegativeSpeed_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 49.5,
            lon = 31.2,
            speed = -1.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_DefaultTimestamp_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 49.5,
            lon = 31.2,
            speed = 5.0m,
            timestamp = default(DateTime)
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_InvalidHeading_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 49.5,
            lon = 31.2,
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc),
            heading = 361.0  // invalid: > 360
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Webhook_NegativeFuel_ReturnsBadRequest()
    {
        var payload = new
        {
            deviceId = "123456789012345",
            lat = 49.5,
            lon = 31.2,
            speed = 5.0m,
            timestamp = new DateTime(2026, 3, 22, 12, 0, 0, DateTimeKind.Utc),
            fuel = -1.0m
        };

        var response = await Client.PostAsJsonAsync("/api/gps/webhook", payload, JsonOptions);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
