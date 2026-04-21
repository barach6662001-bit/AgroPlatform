using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.AddMaintenance;
using AgroPlatform.Application.Machinery.Queries.ExportMaintenanceRecords;
using AgroPlatform.Application.Machinery.Queries.GetMaintenanceRecords;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class MaintenanceHandlerTests
{
    private sealed class TestCurrentUserService : ICurrentUserService
    {
        public string? UserId => null;
        public string? UserName => null;
        public Guid TenantId { get; } = Guid.NewGuid();
        public UserRole? Role => null;
        public bool IsInRole(UserRole role) => false;
        public bool IsSuperAdmin => false;
    }

    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── AddMaintenanceHandler ────────────────────────────────────────────────

    [Fact]
    public async Task AddMaintenance_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var machine = new Machine { Name = "Tractor", TenantId = currentUser.TenantId, Type = MachineryType.Tractor };
        context.Machines.Add(machine);
        await context.SaveChangesAsync();

        var handler = new AddMaintenanceHandler(context, currentUser);
        var command = new AddMaintenanceCommand(machine.Id, DateTime.UtcNow, "Scheduled", null, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task AddMaintenance_ValidCommand_CreatesRecordAndUpdatesLastMaintenanceDate()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var machine = new Machine { Name = "Harvester", TenantId = currentUser.TenantId, Type = MachineryType.Combine };
        context.Machines.Add(machine);
        await context.SaveChangesAsync();

        var handler = new AddMaintenanceHandler(context, currentUser);
        var date = new DateTime(2024, 5, 10, 0, 0, 0, DateTimeKind.Utc);
        var command = new AddMaintenanceCommand(machine.Id, date, "Repair", "Engine oil change", 500m, 120.5m, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var record = await ((TestDbContext)context).MaintenanceRecords.FindAsync(id);
        record.Should().NotBeNull();
        record!.MachineId.Should().Be(machine.Id);
        record.Date.Should().Be(date);
        record.Type.Should().Be("Repair");
        record.Description.Should().Be("Engine oil change");
        record.Cost.Should().Be(500m);
        record.HoursAtMaintenance.Should().Be(120.5m);

        var updatedMachine = await ((TestDbContext)context).Machines.FindAsync(machine.Id);
        updatedMachine!.LastMaintenanceDate.Should().Be(date);
    }

    [Fact]
    public async Task AddMaintenance_MachineNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var handler = new AddMaintenanceHandler(context, currentUser);
        var command = new AddMaintenanceCommand(Guid.NewGuid(), DateTime.UtcNow, "Scheduled", null, null, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetMaintenanceRecordsHandler ─────────────────────────────────────────

    [Fact]
    public async Task GetMaintenanceRecords_EmptyDatabase_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var handler = new GetMaintenanceRecordsHandler(context);

        var result = await handler.Handle(new GetMaintenanceRecordsQuery(Guid.NewGuid()), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetMaintenanceRecords_WithRecords_ReturnsCorrectDtosFilteredByMachine()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var machine1 = new Machine { Name = "Tractor 1", TenantId = currentUser.TenantId, Type = MachineryType.Tractor };
        var machine2 = new Machine { Name = "Tractor 2", TenantId = currentUser.TenantId, Type = MachineryType.Tractor };
        context.Machines.AddRange(machine1, machine2);
        await context.SaveChangesAsync();

        var date = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        context.MaintenanceRecords.Add(new MaintenanceRecord
        {
            TenantId = currentUser.TenantId,
            MachineId = machine1.Id,
            Date = date,
            Type = "Scheduled",
            Description = "Oil change",
            Cost = 300m,
        });
        context.MaintenanceRecords.Add(new MaintenanceRecord
        {
            TenantId = currentUser.TenantId,
            MachineId = machine2.Id,
            Date = date,
            Type = "Repair",
        });
        await context.SaveChangesAsync();

        var handler = new GetMaintenanceRecordsHandler(context);
        var result = await handler.Handle(new GetMaintenanceRecordsQuery(machine1.Id), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Type.Should().Be("Scheduled");
        result[0].Description.Should().Be("Oil change");
        result[0].Cost.Should().Be(300m);
    }

    // ── ExportMaintenanceRecordsHandler ──────────────────────────────────────

    [Fact]
    public async Task ExportMaintenanceRecords_ReturnsCsvWithCorrectContentType()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var machine = new Machine { Name = "Tractor", TenantId = currentUser.TenantId, Type = MachineryType.Tractor };
        context.Machines.Add(machine);
        context.MaintenanceRecords.Add(new MaintenanceRecord
        {
            TenantId = currentUser.TenantId,
            MachineId = machine.Id,
            Date = DateTime.UtcNow,
            Type = "Inspection",
        });
        await context.SaveChangesAsync();

        var handler = new ExportMaintenanceRecordsHandler(context);
        var result = await handler.Handle(new ExportMaintenanceRecordsQuery(machine.Id), CancellationToken.None);

        result.ContentType.Should().Be("text/csv");
        result.Content.Should().NotBeEmpty();
        result.FileName.Should().Contain("maintenance");
    }

    [Fact]
    public async Task ExportMaintenanceRecords_ContentContainsCsvHeaderAndData()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var machine = new Machine { Name = "Harvester", TenantId = currentUser.TenantId, Type = MachineryType.Combine };
        context.Machines.Add(machine);
        context.MaintenanceRecords.Add(new MaintenanceRecord
        {
            TenantId = currentUser.TenantId,
            MachineId = machine.Id,
            Date = new DateTime(2024, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            Type = "Repair",
            Description = "Bearing replacement",
            Cost = 1200m,
        });
        await context.SaveChangesAsync();

        var handler = new ExportMaintenanceRecordsHandler(context);
        var result = await handler.Handle(new ExportMaintenanceRecordsQuery(machine.Id), CancellationToken.None);

        var content = System.Text.Encoding.UTF8.GetString(result.Content).TrimStart('\ufeff');
        content.Should().Contain("Date,Type,Description,Cost,HoursAtMaintenance");
        content.Should().Contain("Repair");
        content.Should().Contain("1200");
    }
}
