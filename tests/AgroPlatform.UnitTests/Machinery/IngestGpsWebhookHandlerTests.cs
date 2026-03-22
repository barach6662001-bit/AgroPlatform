using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NSubstitute;

namespace AgroPlatform.UnitTests.Machinery;

public class IngestGpsWebhookHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static Machine CreateMachineWithImei(IAppDbContext context, string imei = "123456789012345")
    {
        var machine = new Machine
        {
            Name = "Webhook Tractor",
            InventoryNumber = Guid.NewGuid().ToString("N")[..15],
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel,
            ImeiNumber = imei
        };
        context.Machines.Add(machine);
        context.SaveChangesAsync().GetAwaiter().GetResult();
        return machine;
    }

    /// <summary>Creates a square polygon centered at (centerLat, centerLng) with the given half-size in degrees.</summary>
    private static Polygon CreateSquarePolygon(double centerLat, double centerLng, double halfSize)
    {
        var factory = new GeometryFactory(new PrecisionModel(), 4326);
        var ring = new[]
        {
            new Coordinate(centerLng - halfSize, centerLat - halfSize),
            new Coordinate(centerLng + halfSize, centerLat - halfSize),
            new Coordinate(centerLng + halfSize, centerLat + halfSize),
            new Coordinate(centerLng - halfSize, centerLat + halfSize),
            new Coordinate(centerLng - halfSize, centerLat - halfSize),
        };
        var polygon = factory.CreatePolygon(ring);
        polygon.SRID = 4326;
        return polygon;
    }

    private static IngestGpsWebhookCommand MakeCommand(string imei, double lat, double lon) =>
        new(imei, lat, lon, 10m, DateTime.UtcNow, null, null);

    [Fact]
    public async Task Handle_UnknownDevice_ReturnsGuidEmpty()
    {
        var context = CreateDbContext();
        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        var result = await handler.Handle(MakeCommand("unknown-imei", 50.0, 30.0), CancellationToken.None);

        result.Should().Be(Guid.Empty);
        await notifications.DidNotReceive().SendAsync(
            Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_KnownDevice_SavesGpsTrackAndReturnsId()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "111122223333444");
        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        var trackId = await handler.Handle(MakeCommand("111122223333444", 50.0, 30.0), CancellationToken.None);

        trackId.Should().NotBeEmpty();
        var saved = await ((TestDbContext)context).GpsTracks.FindAsync(trackId);
        saved.Should().NotBeNull();
        saved!.VehicleId.Should().Be(machine.Id);
    }

    [Fact]
    public async Task Handle_KnownDevice_BroadcastsFleetUpdate()
    {
        var context = CreateDbContext();
        CreateMachineWithImei(context, "555566667777888");
        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("555566667777888", 50.0, 30.0), CancellationToken.None);

        await fleetHub.Received(1).BroadcastPositionAsync(
            Arg.Any<Guid>(), Arg.Any<FleetPositionUpdate>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PointInsideFieldPolygon_DoesNotSendNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "100200300400500");

        context.Fields.Add(new Field
        {
            Name = "Inside Field",
            AreaHectares = 5m,
            TenantId = machine.TenantId,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.1)
        });
        await context.SaveChangesAsync();

        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("100200300400500", 50.0, 30.0), CancellationToken.None);

        await notifications.DidNotReceive().SendAsync(
            Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PointOutsideAllFieldPolygons_SendsWarningNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "200300400500600");

        // Field polygon around (50.0, 30.0) — the GPS point (51.0, 31.0) is outside
        context.Fields.Add(new Field
        {
            Name = "Remote Field",
            AreaHectares = 5m,
            TenantId = machine.TenantId,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.01)
        });
        await context.SaveChangesAsync();

        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("200300400500600", 51.0, 31.0), CancellationToken.None);

        await notifications.Received(1).SendAsync(
            machine.TenantId,
            "warning",
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PointOutsideAndRecentAlertExists_SuppressesSpam()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "300400500600700");

        context.Fields.Add(new Field
        {
            Name = "Far Field",
            AreaHectares = 5m,
            TenantId = machine.TenantId,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.01)
        });

        // Pre-populate a recent geofence notification for the same machine
        context.Notifications.Add(new Notification
        {
            TenantId = machine.TenantId,
            Type = "warning",
            Title = "Техніка за межами поля",
            Body = $"Техніка '{machine.Name}' знаходиться за межами полів (51.00000, 31.00000)",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-5) // 5 minutes ago — within cooldown
        });
        await context.SaveChangesAsync();

        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("300400500600700", 51.0, 31.0), CancellationToken.None);

        // Alert must be suppressed because a recent one already exists
        await notifications.DidNotReceive().SendAsync(
            Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PointOutsideAndOldAlertExpired_SendsNewNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "400500600700800");

        context.Fields.Add(new Field
        {
            Name = "Old Alert Field",
            AreaHectares = 5m,
            TenantId = machine.TenantId,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.01)
        });

        // Pre-populate an OLD geofence notification (outside cooldown window)
        context.Notifications.Add(new Notification
        {
            TenantId = machine.TenantId,
            Type = "warning",
            Title = "Техніка за межами поля",
            Body = $"Техніка '{machine.Name}' знаходиться за межами полів (51.00000, 31.00000)",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-60) // 60 minutes ago — beyond cooldown
        });
        await context.SaveChangesAsync();

        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("400500600700800", 51.0, 31.0), CancellationToken.None);

        // Cooldown has expired — a new alert should be sent
        await notifications.Received(1).SendAsync(
            machine.TenantId,
            "warning",
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NoFieldsWithGeometry_SendsNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachineWithImei(context, "500600700800900");

        // Field exists but has no geometry
        context.Fields.Add(new Field
        {
            Name = "No Geometry Field",
            AreaHectares = 5m,
            TenantId = machine.TenantId
        });
        await context.SaveChangesAsync();

        var fleetHub = Substitute.For<IFleetHubService>();
        var notifications = Substitute.For<INotificationService>();
        var handler = new IngestGpsWebhookHandler(context, fleetHub, notifications);

        await handler.Handle(MakeCommand("500600700800900", 50.0, 30.0), CancellationToken.None);

        await notifications.Received(1).SendAsync(
            Arg.Any<Guid>(), "warning", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
