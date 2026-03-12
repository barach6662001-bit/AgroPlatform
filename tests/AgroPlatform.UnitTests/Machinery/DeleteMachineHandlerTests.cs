using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.Commands.DeleteMachine;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Machinery;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Machinery;

public class DeleteMachineHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task DeleteMachine_ExistingMachine_SetsIsDeletedTrue()
    {
        var context = CreateDbContext();
        var machine = new Machine
        {
            Name = "Tractor 1",
            InventoryNumber = "INV-001",
            Type = MachineryType.Tractor,
            FuelType = FuelType.Diesel,
        };
        context.Machines.Add(machine);
        await context.SaveChangesAsync();

        var handler = new DeleteMachineHandler(context);
        await handler.Handle(new DeleteMachineCommand(machine.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).Machines.FindAsync(machine.Id);
        found!.IsDeleted.Should().BeTrue();
        found.DeletedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteMachine_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteMachineHandler(context);

        var act = async () => await handler.Handle(new DeleteMachineCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
