using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.UpdateMachine;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class UpdateMachineHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task UpdateMachine_ExistingMachine_UpdatesProperties()
    {
        var context = CreateDbContext();
        var machine = new Machine
        {
            Name = "Old Tractor",
            InventoryNumber = "INV-001",
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel,
            Status = MachineryStatus.Active,
        };
        context.Machines.Add(machine);
        await context.SaveChangesAsync();

        var handler = new UpdateMachineHandler(context);
        var command = new UpdateMachineCommand(machine.Id, "New Tractor", "John Deere", "6120M", 2022, MachineryStatus.UnderRepair, FuelType.Diesel, 8.5m, null, null);
        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).Machines.FindAsync(machine.Id);
        updated!.Name.Should().Be("New Tractor");
        updated.Brand.Should().Be("John Deere");
        updated.Year.Should().Be(2022);
        updated.Status.Should().Be(MachineryStatus.UnderRepair);
        updated.FuelConsumptionPerHour.Should().Be(8.5m);
    }

    [Fact]
    public async Task UpdateMachine_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateMachineHandler(context);
        var command = new UpdateMachineCommand(Guid.NewGuid(), "Name", null, null, null, MachineryStatus.Active, FuelType.Diesel, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
