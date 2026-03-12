using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.AddMaintenance;
using AgroPlatform.Application.Machinery.Queries.GetMaintenanceRecords;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.UnitTests.TestDoubles;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class MaintenanceHandlerTests
{
    private static (IAppDbContext ctx, FakeCurrentUserService user) CreateContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var user = new FakeCurrentUserService();
        return (new TestDbContext(options), user);
    }

    private static Machine CreateMachine(IAppDbContext ctx)
    {
        var machine = new Machine
        {
            Name = "Tractor T-150",
            InventoryNumber = "TRC-001",
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel,
        };
        ctx.Machines.Add(machine);
        return machine;
    }

    // ── AddMaintenance ───────────────────────────────────────────────────────

    [Fact]
    public async Task AddMaintenance_ValidCommand_CreatesRecordAndUpdatesLastDate()
    {
        var (ctx, user) = CreateContext();
        var machine = CreateMachine(ctx);
        await ctx.SaveChangesAsync();

        var handler = new AddMaintenanceHandler(ctx, user);
        var date = new DateTime(2025, 3, 10, 0, 0, 0, DateTimeKind.Utc);
        var command = new AddMaintenanceCommand(machine.Id, date, "Scheduled", "Oil change", 500m, 1200m, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var record = await ((TestDbContext)ctx).MaintenanceRecords.FindAsync(id);
        record.Should().NotBeNull();
        record!.MachineId.Should().Be(machine.Id);
        record.Type.Should().Be("Scheduled");
        record.Cost.Should().Be(500m);
        record.HoursAtMaintenance.Should().Be(1200m);

        var updatedMachine = await ((TestDbContext)ctx).Machines.FindAsync(machine.Id);
        updatedMachine!.LastMaintenanceDate.Should().Be(date);
    }

    [Fact]
    public async Task AddMaintenance_MachineNotFound_ThrowsNotFoundException()
    {
        var (ctx, user) = CreateContext();
        var handler = new AddMaintenanceHandler(ctx, user);
        var command = new AddMaintenanceCommand(Guid.NewGuid(), DateTime.UtcNow, "Repair", null, null, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetMaintenanceRecords ─────────────────────────────────────────────────

    [Fact]
    public async Task GetMaintenanceRecords_ByMachineId_ReturnsOrderedByDateDesc()
    {
        var (ctx, _) = CreateContext();
        var machine = CreateMachine(ctx);
        await ctx.SaveChangesAsync();

        ctx.MaintenanceRecords.Add(new MaintenanceRecord { MachineId = machine.Id, Date = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc), Type = "Scheduled" });
        ctx.MaintenanceRecords.Add(new MaintenanceRecord { MachineId = machine.Id, Date = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc), Type = "Repair" });
        ctx.MaintenanceRecords.Add(new MaintenanceRecord { MachineId = machine.Id, Date = new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc), Type = "Inspection" });
        await ctx.SaveChangesAsync();

        var handler = new GetMaintenanceRecordsHandler(ctx);
        var result = await handler.Handle(new GetMaintenanceRecordsQuery(machine.Id), CancellationToken.None);

        result.Should().HaveCount(3);
        result[0].Date.Should().BeAfter(result[1].Date);
        result[1].Date.Should().BeAfter(result[2].Date);
    }
}
