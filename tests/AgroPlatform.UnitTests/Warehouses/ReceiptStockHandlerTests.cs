using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.ReceiptStock;
using AgroPlatform.Application.Warehouses.Services;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Warehouses;

public class ReceiptStockHandlerTests
{
    private static (TestDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance) CreateDependencies()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new TestDbContext(options);
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);
        var stockBalance = new StockBalanceService(context, dateTime);
        return (context, dateTime, stockBalance);
    }

    [Fact]
    public async Task Handle_ValidReceipt_CreatesStockMoveAndBalance()
    {
        // Arrange
        var (context, dateTime, stockBalance) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "WHT001", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new ReceiptStockHandler(context, dateTime, stockBalance);
        var command = new ReceiptStockCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null);

        // Act
        var moveId = await handler.Handle(command, CancellationToken.None);

        // Assert
        moveId.Should().NotBeEmpty();

        var move = await context.StockMoves.FindAsync(moveId);
        move.Should().NotBeNull();
        move!.Quantity.Should().Be(100m);

        var balance = await context.StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        balance.Should().NotBeNull();
        balance!.BalanceBase.Should().Be(100m);
    }

    [Fact]
    public async Task Handle_SecondReceipt_IncrementsBalance()
    {
        // Arrange
        var (context, dateTime, stockBalance) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "WHT002", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new ReceiptStockHandler(context, dateTime, stockBalance);

        // Act
        await handler.Handle(new ReceiptStockCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null), CancellationToken.None);
        await handler.Handle(new ReceiptStockCommand(warehouse.Id, item.Id, null, 50m, "kg", null, null), CancellationToken.None);

        // Assert
        var balance = await context.StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        balance!.BalanceBase.Should().Be(150m);
    }

    [Fact]
    public async Task Handle_IdempotentRequest_ReturnsSameMoveId()
    {
        // Arrange
        var (context, dateTime, stockBalance) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "WHT003", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new ReceiptStockHandler(context, dateTime, stockBalance);
        var clientOpId = "op-123";

        // Act
        var moveId1 = await handler.Handle(new ReceiptStockCommand(warehouse.Id, item.Id, null, 100m, "kg", null, clientOpId), CancellationToken.None);
        var moveId2 = await handler.Handle(new ReceiptStockCommand(warehouse.Id, item.Id, null, 100m, "kg", null, clientOpId), CancellationToken.None);

        // Assert
        moveId1.Should().Be(moveId2);
    }

    [Fact]
    public async Task Handle_WarehouseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var (context, dateTime, stockBalance) = CreateDependencies();
        var handler = new ReceiptStockHandler(context, dateTime, stockBalance);
        var command = new ReceiptStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, 10m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_InactiveWarehouse_ThrowsConflictException()
    {
        // Arrange
        var (context, dateTime, stockBalance) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Inactive", IsActive = false };
        var item = new WarehouseItem { Name = "Wheat", Code = "WHT004", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new ReceiptStockHandler(context, dateTime, stockBalance);
        var command = new ReceiptStockCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
    }
}
