using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Warehouses;

public class CreateWarehouseHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task CreateWarehouse_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateWarehouseHandler(context);
        var command = new CreateWarehouseCommand("Storage A", "Block 1", null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateWarehouse_ValidCommand_PersistsWarehouseInDatabase()
    {
        var context = CreateDbContext();
        var handler = new CreateWarehouseHandler(context);
        var command = new CreateWarehouseCommand("Main Warehouse", "North Gate", null);

        var id = await handler.Handle(command, CancellationToken.None);

        var warehouse = await ((TestDbContext)context).Warehouses.FindAsync(id);
        warehouse.Should().NotBeNull();
        warehouse!.Name.Should().Be("Main Warehouse");
        warehouse.Location.Should().Be("North Gate");
    }

    [Fact]
    public async Task CreateWarehouse_NewWarehouse_IsActiveByDefault()
    {
        var context = CreateDbContext();
        var handler = new CreateWarehouseHandler(context);
        var command = new CreateWarehouseCommand("Grain Store", null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var warehouse = await ((TestDbContext)context).Warehouses.FindAsync(id);
        warehouse!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateWarehouse_WithoutLocation_PersistsWithNullLocation()
    {
        var context = CreateDbContext();
        var handler = new CreateWarehouseHandler(context);
        var command = new CreateWarehouseCommand("Secondary Store", null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var warehouse = await ((TestDbContext)context).Warehouses.FindAsync(id);
        warehouse!.Location.Should().BeNull();
    }

    [Fact]
    public async Task CreateWarehouse_MultipleWarehouses_EachGetsUniqueId()
    {
        var context = CreateDbContext();
        var handler = new CreateWarehouseHandler(context);

        var id1 = await handler.Handle(new CreateWarehouseCommand("Warehouse 1", null, null), CancellationToken.None);
        var id2 = await handler.Handle(new CreateWarehouseCommand("Warehouse 2", null, null), CancellationToken.None);

        id1.Should().NotBe(id2);
        var count = await ((TestDbContext)context).Warehouses.CountAsync();
        count.Should().Be(2);
    }
}
