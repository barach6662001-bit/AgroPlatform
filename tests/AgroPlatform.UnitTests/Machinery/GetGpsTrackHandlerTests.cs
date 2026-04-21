using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Queries.GetGpsTrack;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class GetGpsTrackHandlerTests
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
            Name = "GPS Tractor",
            InventoryNumber = $"GPS-{Guid.NewGuid():N}"[..12],
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel
        };
        context.Machines.Add(machine);
        context.SaveChangesAsync().GetAwaiter().GetResult();
        return machine;
    }

    [Fact]
    public async Task GetGpsTrack_ValidRange_ReturnsOrderedTracks()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.1, Lng = 30.1, Speed = 10m, FuelLevel = 80m, Timestamp = baseTime.AddMinutes(10) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.2, Lng = 30.2, Speed = 15m, FuelLevel = 78m, Timestamp = baseTime.AddMinutes(5) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.3, Lng = 30.3, Speed = 20m, FuelLevel = 76m, Timestamp = baseTime.AddMinutes(15) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machine.Id, baseTime, baseTime.AddHours(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().HaveCount(3);
        result[0].Timestamp.Should().BeBefore(result[1].Timestamp);
        result[1].Timestamp.Should().BeBefore(result[2].Timestamp);
    }

    [Fact]
    public async Task GetGpsTrack_NoTracksInRange_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.1, Lng = 30.1, Speed = 10m, FuelLevel = 80m, Timestamp = baseTime.AddDays(-1) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machine.Id, baseTime, baseTime.AddHours(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetGpsTrack_NonExistentMachine_ReturnsNull()
    {
        var context = CreateDbContext();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(Guid.NewGuid(), DateTime.UtcNow.AddHours(-1), DateTime.UtcNow),
            CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetGpsTrack_FiltersTracksByVehicleId()
    {
        var context = CreateDbContext();
        var machineA = CreateMachine(context);
        var machineB = CreateMachine(context);

        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        context.GpsTracks.Add(new GpsTrack { VehicleId = machineA.Id, Lat = 50.1, Lng = 30.1, Speed = 10m, FuelLevel = 80m, Timestamp = baseTime.AddMinutes(5) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machineB.Id, Lat = 51.1, Lng = 31.1, Speed = 20m, FuelLevel = 70m, Timestamp = baseTime.AddMinutes(5) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machineA.Id, baseTime, baseTime.AddHours(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result[0].VehicleId.Should().Be(machineA.Id);
    }

    [Fact]
    public async Task GetGpsTrack_MapsAllFieldsCorrectly()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);
        var trackTime = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

        context.GpsTracks.Add(new GpsTrack
        {
            VehicleId = machine.Id,
            Lat = 49.8397,
            Lng = 24.0297,
            Speed = 35.5m,
            FuelLevel = 60.25m,
            Timestamp = trackTime
        });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machine.Id, trackTime.AddMinutes(-1), trackTime.AddMinutes(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        var dto = result[0];
        dto.VehicleId.Should().Be(machine.Id);
        dto.Lat.Should().Be(49.8397);
        dto.Lng.Should().Be(24.0297);
        dto.Speed.Should().Be(35.5m);
        dto.FuelLevel.Should().Be(60.25m);
        dto.Timestamp.Should().Be(trackTime);
    }

    [Fact]
    public async Task GetGpsTrack_DateRangeFilter_ReturnsOnlyPointsInRange()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        var from = new DateTime(2026, 3, 1, 8, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc);

        // 2 points before range
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.0, Lng = 30.0, Speed = 5m, FuelLevel = 90m, Timestamp = from.AddHours(-2) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.1, Lng = 30.1, Speed = 5m, FuelLevel = 89m, Timestamp = from.AddMinutes(-1) });
        // 2 points inside range
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.2, Lng = 30.2, Speed = 10m, FuelLevel = 88m, Timestamp = from.AddMinutes(30) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.3, Lng = 30.3, Speed = 15m, FuelLevel = 87m, Timestamp = from.AddHours(1) });
        // 1 point after range
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.4, Lng = 30.4, Speed = 20m, FuelLevel = 86m, Timestamp = to.AddMinutes(1) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machine.Id, from, to),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().HaveCount(2);
        result.Should().AllSatisfy(p =>
        {
            p.Timestamp.Should().BeOnOrAfter(from);
            p.Timestamp.Should().BeOnOrBefore(to);
        });
    }

    [Fact]
    public async Task GetGpsTrack_UnknownMachineId_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var machineWithTracks = CreateMachine(context);
        var machineWithoutTracks = CreateMachine(context);

        var baseTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        context.GpsTracks.Add(new GpsTrack { VehicleId = machineWithTracks.Id, Lat = 50.1, Lng = 30.1, Speed = 10m, FuelLevel = 80m, Timestamp = baseTime.AddMinutes(10) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machineWithoutTracks.Id, baseTime, baseTime.AddHours(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetGpsTrack_MultiplePoints_ReturnsOrderedByTimestamp()
    {
        var context = CreateDbContext();
        var machine = CreateMachine(context);

        var baseTime = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc);
        // Add 5 points in random order
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.5, Lng = 30.5, Speed = 25m, FuelLevel = 72m, Timestamp = baseTime.AddMinutes(50) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.1, Lng = 30.1, Speed = 5m,  FuelLevel = 80m, Timestamp = baseTime.AddMinutes(10) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.3, Lng = 30.3, Speed = 15m, FuelLevel = 76m, Timestamp = baseTime.AddMinutes(30) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.2, Lng = 30.2, Speed = 10m, FuelLevel = 78m, Timestamp = baseTime.AddMinutes(20) });
        context.GpsTracks.Add(new GpsTrack { VehicleId = machine.Id, Lat = 50.4, Lng = 30.4, Speed = 20m, FuelLevel = 74m, Timestamp = baseTime.AddMinutes(40) });
        await context.SaveChangesAsync();

        var handler = new GetGpsTrackHandler(context);
        var result = await handler.Handle(
            new GetGpsTrackQuery(machine.Id, baseTime, baseTime.AddHours(1)),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.Should().HaveCount(5);
        for (var i = 1; i < result.Count; i++)
            result[i].Timestamp.Should().BeAfter(result[i - 1].Timestamp);
    }
}
