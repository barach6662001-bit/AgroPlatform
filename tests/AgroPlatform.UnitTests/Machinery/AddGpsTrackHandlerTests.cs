using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.AddGpsTrack;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NSubstitute;

namespace AgroPlatform.UnitTests.Machinery;

public class AddGpsTrackHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static Machine CreateMachine(IAppDbContext context)
    {
        var machine = new Machine
        {
            Name = "Geofence Tractor",
            InventoryNumber = $"GF-{Guid.NewGuid():N}"[..12],
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel
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

    [Fact]
    public async Task Handle_ValidTrack_SavesGpsTrack()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);
        var notifications = Substitute.For<INotificationService>();

        var handler = new AddGpsTrackHandler(context, notifications);
        var ts = new DateTime(2026, 3, 1, 8, 0, 0, DateTimeKind.Utc);
        var command = new AddGpsTrackCommand(machine.Id, 50.0, 30.0, 10m, 75m, ts);

        var trackId = await handler.Handle(command, CancellationToken.None);

        trackId.Should().NotBeEmpty();
        var saved = await ((TestDbContext)context).GpsTracks.FindAsync(trackId);
        saved.Should().NotBeNull();
        saved!.VehicleId.Should().Be(machine.Id);
        saved.Lat.Should().Be(50.0);
        saved.Lng.Should().Be(30.0);
        saved.Speed.Should().Be(10m);
        saved.FuelLevel.Should().Be(75m);
        saved.Timestamp.Should().Be(ts);
    }

    [Fact]
    public async Task Handle_NonExistentMachine_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var notifications = Substitute.For<INotificationService>();

        var handler = new AddGpsTrackHandler(context, notifications);
        var command = new AddGpsTrackCommand(Guid.NewGuid(), 50.0, 30.0, 10m, 75m, DateTime.UtcNow);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_PointInsideFieldPolygon_DoesNotSendNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        // Add a field whose polygon covers (50.0, 30.0)
        context.Fields.Add(new Field
        {
            Name = "Inside Field",
            AreaHectares = 5m,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.1)
        });
        await context.SaveChangesAsync();

        var notifications = Substitute.For<INotificationService>();
        var handler = new AddGpsTrackHandler(context, notifications);
        var command = new AddGpsTrackCommand(machine.Id, 50.0, 30.0, 5m, 80m, DateTime.UtcNow);

        await handler.Handle(command, CancellationToken.None);

        await notifications.DidNotReceive().SendAsync(
            Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PointOutsideAllFieldPolygons_SendsWarningNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        // Field polygon around (50.0, 30.0) — the GPS point (51.0, 31.0) is outside
        context.Fields.Add(new Field
        {
            Name = "Remote Field",
            AreaHectares = 5m,
            Geometry = CreateSquarePolygon(50.0, 30.0, 0.01)
        });
        await context.SaveChangesAsync();

        var notifications = Substitute.For<INotificationService>();
        var handler = new AddGpsTrackHandler(context, notifications);
        var command = new AddGpsTrackCommand(machine.Id, 51.0, 31.0, 15m, 70m, DateTime.UtcNow);

        await handler.Handle(command, CancellationToken.None);

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
        var machine = CreateMachine(context);

        // Field with no geometry polygon
        context.Fields.Add(new Field { Name = "No Geometry Field", AreaHectares = 5m });
        await context.SaveChangesAsync();

        var notifications = Substitute.For<INotificationService>();
        var handler = new AddGpsTrackHandler(context, notifications);
        var command = new AddGpsTrackCommand(machine.Id, 50.0, 30.0, 5m, 80m, DateTime.UtcNow);

        await handler.Handle(command, CancellationToken.None);

        // No field has geometry, so machine is considered outside
        await notifications.Received(1).SendAsync(
            Arg.Any<Guid>(), "warning", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NoFields_SendsNotification()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        var notifications = Substitute.For<INotificationService>();
        var handler = new AddGpsTrackHandler(context, notifications);
        var command = new AddGpsTrackCommand(machine.Id, 50.0, 30.0, 5m, 80m, DateTime.UtcNow);

        await handler.Handle(command, CancellationToken.None);

        await notifications.Received(1).SendAsync(
            Arg.Any<Guid>(), "warning", Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
