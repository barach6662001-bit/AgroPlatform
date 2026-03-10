using AgroPlatform.Api.Hubs;
using AgroPlatform.Api.Services;
using AgroPlatform.Application.Fleet;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;

namespace AgroPlatform.UnitTests.Fleet;

public class FleetHubServiceTests
{
    private readonly IHubContext<FleetHub> _hubContext;
    private readonly IHubClients _clients;
    private readonly IClientProxy _clientProxy;
    private readonly FleetHubService _sut;

    public FleetHubServiceTests()
    {
        _clientProxy = Substitute.For<IClientProxy>();
        _clients = Substitute.For<IHubClients>();
        _clients.Group(Arg.Any<string>()).Returns(_clientProxy);

        _hubContext = Substitute.For<IHubContext<FleetHub>>();
        _hubContext.Clients.Returns(_clients);

        _sut = new FleetHubService(_hubContext, NullLogger<FleetHubService>.Instance);
    }

    private static FleetPositionUpdate ValidUpdate(Guid? vehicleId = null) =>
        new(
            VehicleId: vehicleId ?? Guid.NewGuid(),
            Lat: 48.45,
            Lng: 35.02,
            Speed: 25.5,
            Fuel: 120.0,
            TimestampUtc: DateTime.UtcNow
        );

    // ── Happy path ────────────────────────────────────────────────────────────

    [Fact]
    public async Task BroadcastPositionAsync_ValidPayload_SendsToTenantGroup()
    {
        var tenantId = Guid.NewGuid();
        var update = ValidUpdate();

        await _sut.BroadcastPositionAsync(tenantId, update);

        _clients.Received(1).Group(FleetHub.TenantGroup(tenantId));
        await _clientProxy.Received(1).SendCoreAsync(
            FleetHub.ReceivePositionUpdate,
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task BroadcastPositionAsync_ValidPayload_UsesCorrectGroupName()
    {
        var tenantId = Guid.NewGuid();
        var expectedGroup = $"tenant-{tenantId}";

        await _sut.BroadcastPositionAsync(tenantId, ValidUpdate());

        _clients.Received(1).Group(expectedGroup);
    }

    // ── Guard: empty tenantId ────────────────────────────────────────────────

    [Fact]
    public async Task BroadcastPositionAsync_EmptyTenantId_DoesNotSend()
    {
        await _sut.BroadcastPositionAsync(Guid.Empty, ValidUpdate());

        await _clientProxy.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(),
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>());
    }

    // ── Guard: invalid coordinates ───────────────────────────────────────────

    [Theory]
    [InlineData(-91.0)]
    [InlineData(91.0)]
    public async Task BroadcastPositionAsync_InvalidLatitude_DoesNotSend(double lat)
    {
        var update = ValidUpdate() with { Lat = lat };
        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        await _clientProxy.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(-181.0)]
    [InlineData(181.0)]
    public async Task BroadcastPositionAsync_InvalidLongitude_DoesNotSend(double lng)
    {
        var update = ValidUpdate() with { Lng = lng };
        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        await _clientProxy.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>());
    }

    // ── Guard: negative numeric fields ───────────────────────────────────────

    [Fact]
    public async Task BroadcastPositionAsync_NegativeSpeed_DoesNotSend()
    {
        var update = ValidUpdate() with { Speed = -1 };
        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        await _clientProxy.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task BroadcastPositionAsync_NegativeFuel_DoesNotSend()
    {
        var update = ValidUpdate() with { Fuel = -0.1 };
        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        await _clientProxy.DidNotReceive().SendCoreAsync(
            Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>());
    }

    // ── Boundary values ──────────────────────────────────────────────────────

    [Theory]
    [InlineData(-90.0, -180.0)]
    [InlineData(90.0, 180.0)]
    [InlineData(0.0, 0.0)]
    public async Task BroadcastPositionAsync_BoundaryCoordinates_Sends(double lat, double lng)
    {
        var update = ValidUpdate() with { Lat = lat, Lng = lng };

        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        await _clientProxy.Received(1).SendCoreAsync(
            FleetHub.ReceivePositionUpdate,
            Arg.Any<object?[]>(),
            Arg.Any<CancellationToken>());
    }

    // ── Payload contract ─────────────────────────────────────────────────────

    [Fact]
    public async Task BroadcastPositionAsync_PayloadContainsAllRequiredFields()
    {
        var vehicleId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var update = new FleetPositionUpdate(vehicleId, 48.45, 35.02, 25.5, 120.0, now);

        object?[]? capturedArgs = null;
        _clientProxy
            .When(p => p.SendCoreAsync(Arg.Any<string>(), Arg.Any<object?[]>(), Arg.Any<CancellationToken>()))
            .Do(call => capturedArgs = call.Arg<object?[]>());

        await _sut.BroadcastPositionAsync(Guid.NewGuid(), update);

        capturedArgs.Should().NotBeNull();
        capturedArgs!.Should().HaveCount(1);
        var payload = (FleetPositionUpdate)capturedArgs![0]!;
        payload.VehicleId.Should().Be(vehicleId);
        payload.Lat.Should().Be(48.45);
        payload.Lng.Should().Be(35.02);
        payload.Speed.Should().Be(25.5);
        payload.Fuel.Should().Be(120.0);
        payload.TimestampUtc.Should().Be(now);
    }

    // ── Hub group naming ─────────────────────────────────────────────────────

    [Fact]
    public void TenantGroup_ReturnsExpectedGroupName()
    {
        var tenantId = new Guid("11111111-1111-1111-1111-111111111111");
        FleetHub.TenantGroup(tenantId).Should().Be("tenant-11111111-1111-1111-1111-111111111111");
    }
}
