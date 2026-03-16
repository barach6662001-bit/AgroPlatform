using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.UpdateWarehouseItem;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Warehouses;

public class UpdateWarehouseItemHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task UpdateWarehouseItem_ValidCommand_UpdatesAllFields()
    {
        var context = CreateDbContext();
        var item = new WarehouseItem
        {
            Name = "Old Name",
            Code = "OLD001",
            Category = "Seeds",
            BaseUnit = "kg",
            Description = "Old description",
        };
        ((TestDbContext)context).WarehouseItems.Add(item);
        await ((TestDbContext)context).SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateWarehouseItemHandler(context);
        var command = new UpdateWarehouseItemCommand(item.Id, "New Name", "NEW001", "Fertilizers", "t", "New description", MinimumQuantity: 10, PurchasePrice: null);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).WarehouseItems.FindAsync(item.Id);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("New Name");
        updated.Code.Should().Be("NEW001");
        updated.Category.Should().Be("Fertilizers");
        updated.BaseUnit.Should().Be("t");
        updated.Description.Should().Be("New description");
    }

    [Fact]
    public async Task UpdateWarehouseItem_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateWarehouseItemHandler(context);
        var command = new UpdateWarehouseItemCommand(Guid.NewGuid(), "Name", "CODE", "Seeds", "kg", null, MinimumQuantity: null, PurchasePrice: null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateWarehouseItem_DuplicateCode_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var item1 = new WarehouseItem { Name = "Item 1", Code = "CODE001", Category = "Seeds", BaseUnit = "kg" };
        var item2 = new WarehouseItem { Name = "Item 2", Code = "CODE002", Category = "Fuel", BaseUnit = "l" };
        ((TestDbContext)context).WarehouseItems.Add(item1);
        ((TestDbContext)context).WarehouseItems.Add(item2);
        await ((TestDbContext)context).SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateWarehouseItemHandler(context);
        // Try to update item2 with item1's code
        var command = new UpdateWarehouseItemCommand(item2.Id, "Item 2 Updated", "CODE001", "Fuel", "l", null, MinimumQuantity: null, PurchasePrice: null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateWarehouseItem_SameCode_DoesNotThrow()
    {
        var context = CreateDbContext();
        var item = new WarehouseItem { Name = "Item", Code = "CODE001", Category = "Seeds", BaseUnit = "kg" };
        ((TestDbContext)context).WarehouseItems.Add(item);
        await ((TestDbContext)context).SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateWarehouseItemHandler(context);
        // Update keeping the same code
        var command = new UpdateWarehouseItemCommand(item.Id, "New Name", "CODE001", "Seeds", "kg", null, MinimumQuantity: null, PurchasePrice: null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().NotThrowAsync();
    }
}
