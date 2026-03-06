using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.CreateMachine;
using AgroPlatform.Application.Machinery.Queries.GetMachines;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class CreateMachineHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateMachine ────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateMachine_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateMachineHandler(context);
        var command = new CreateMachineCommand("Tractor T-150", "TRC-001", MachineryType.Tractor, "Kharkiv", "T-150", 2020, FuelType.Diesel, 12.5m);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateMachine_ValidCommand_PersistsMachineInDatabase()
    {
        var context = CreateDbContext();
        var handler = new CreateMachineHandler(context);
        var command = new CreateMachineCommand("Combine Harvester", "CMB-001", MachineryType.Combine, "John Deere", "S790", 2022, FuelType.Diesel, 20m);

        var id = await handler.Handle(command, CancellationToken.None);

        var machine = await ((TestDbContext)context).Machines.FindAsync(id);
        machine.Should().NotBeNull();
        machine!.Name.Should().Be("Combine Harvester");
        machine.InventoryNumber.Should().Be("CMB-001");
        machine.Type.Should().Be(MachineryType.Combine);
        machine.Brand.Should().Be("John Deere");
        machine.Model.Should().Be("S790");
        machine.Year.Should().Be(2022);
        machine.FuelType.Should().Be(FuelType.Diesel);
        machine.FuelConsumptionPerHour.Should().Be(20m);
    }

    [Fact]
    public async Task CreateMachine_NewMachine_HasActiveStatusByDefault()
    {
        var context = CreateDbContext();
        var handler = new CreateMachineHandler(context);
        var command = new CreateMachineCommand("Sprayer SP-1", "SPR-001", MachineryType.Sprayer, null, null, null, FuelType.Diesel, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var machine = await ((TestDbContext)context).Machines.FindAsync(id);
        machine!.Status.Should().Be(MachineryStatus.Active);
    }

    [Fact]
    public async Task CreateMachine_WithOptionalFields_PersistedCorrectly()
    {
        var context = CreateDbContext();
        var handler = new CreateMachineHandler(context);
        var command = new CreateMachineCommand("Truck T-1", "TRK-001", MachineryType.Truck, null, null, null, FuelType.Diesel, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var machine = await ((TestDbContext)context).Machines.FindAsync(id);
        machine!.Brand.Should().BeNull();
        machine.Model.Should().BeNull();
        machine.Year.Should().BeNull();
        machine.FuelConsumptionPerHour.Should().BeNull();
    }

    // ── GetMachines ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMachines_NoFilter_ReturnsAllMachines()
    {
        var context = CreateDbContext();
        context.Machines.Add(new Machine { Name = "Tractor A", InventoryNumber = "T-001", Type = MachineryType.Tractor, FuelType = FuelType.Diesel });
        context.Machines.Add(new Machine { Name = "Combine B", InventoryNumber = "C-001", Type = MachineryType.Combine, FuelType = FuelType.Diesel });
        context.Machines.Add(new Machine { Name = "Sprayer C", InventoryNumber = "S-001", Type = MachineryType.Sprayer, FuelType = FuelType.Diesel });
        await context.SaveChangesAsync();

        var handler = new GetMachinesHandler(context);
        var result = await handler.Handle(new GetMachinesQuery(null, null, null), CancellationToken.None);

        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetMachines_FilterByType_ReturnsOnlyMatchingMachines()
    {
        var context = CreateDbContext();
        context.Machines.Add(new Machine { Name = "Tractor 1", InventoryNumber = "T-001", Type = MachineryType.Tractor, FuelType = FuelType.Diesel });
        context.Machines.Add(new Machine { Name = "Tractor 2", InventoryNumber = "T-002", Type = MachineryType.Tractor, FuelType = FuelType.Diesel });
        context.Machines.Add(new Machine { Name = "Combine 1", InventoryNumber = "C-001", Type = MachineryType.Combine, FuelType = FuelType.Diesel });
        await context.SaveChangesAsync();

        var handler = new GetMachinesHandler(context);
        var result = await handler.Handle(new GetMachinesQuery(MachineryType.Tractor, null, null), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(m => m.Type.Should().Be(MachineryType.Tractor));
    }

    [Fact]
    public async Task GetMachines_FilterByStatus_ReturnsOnlyMatchingMachines()
    {
        var context = CreateDbContext();
        context.Machines.Add(new Machine { Name = "Active Tractor", InventoryNumber = "T-001", Type = MachineryType.Tractor, FuelType = FuelType.Diesel, Status = MachineryStatus.Active });
        context.Machines.Add(new Machine { Name = "Repair Tractor", InventoryNumber = "T-002", Type = MachineryType.Tractor, FuelType = FuelType.Diesel, Status = MachineryStatus.UnderRepair });
        await context.SaveChangesAsync();

        var handler = new GetMachinesHandler(context);
        var result = await handler.Handle(new GetMachinesQuery(null, MachineryStatus.Active, null), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Active Tractor");
    }

    [Fact]
    public async Task GetMachines_SearchByName_ReturnsMatchingMachines()
    {
        var context = CreateDbContext();
        context.Machines.Add(new Machine { Name = "John Deere 7R", InventoryNumber = "JD-001", Type = MachineryType.Tractor, FuelType = FuelType.Diesel, Brand = "John Deere" });
        context.Machines.Add(new Machine { Name = "Case IH Axial", InventoryNumber = "CH-001", Type = MachineryType.Combine, FuelType = FuelType.Diesel, Brand = "Case IH" });
        await context.SaveChangesAsync();

        var handler = new GetMachinesHandler(context);
        var result = await handler.Handle(new GetMachinesQuery(null, null, "john"), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("John Deere 7R");
    }
}
