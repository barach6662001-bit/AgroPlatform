using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;
using AgroPlatform.Application.Warehouses.Services;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Warehouses;

public class InventoryAdjustHandlerTests
{
    private static (TestDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance, IUnitConversionService unitConversion) CreateDependencies()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new TestDbContext(options);
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);
        var stockBalance = new StockBalanceService(context, dateTime);
        var unitConversion = Substitute.For<IUnitConversionService>();
        unitConversion.ConvertAsync(Arg.Any<decimal>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(ci => ci.ArgAt<decimal>(0));
        return (context, dateTime, stockBalance, unitConversion);
    }

    [Fact]
    public async Task InventoryAdjust_PositiveDifference_CreatesInventoryPlusMoveAndUpdatesBalance()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "INV001", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouse.Id,
            ItemId = item.Id,
            BalanceBase = 80m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var handler = new InventoryAdjustHandler(context, dateTime, stockBalance, unitConversion);
        var command = new InventoryAdjustCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.MoveId.Should().NotBeNull().And.NotBe(Guid.Empty);
        result.AdjustmentAmount.Should().Be(20m);

        var move = await context.StockMoves.FindAsync(result.MoveId!.Value);
        move!.MoveType.Should().Be(StockMoveType.InventoryPlus);
        move.Quantity.Should().Be(100m);
        move.QuantityBase.Should().Be(20m);

        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        balance!.BalanceBase.Should().Be(100m);
    }

    [Fact]
    public async Task InventoryAdjust_NegativeDifference_CreatesInventoryMinusMoveAndUpdatesBalance()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "INV002", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouse.Id,
            ItemId = item.Id,
            BalanceBase = 120m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var handler = new InventoryAdjustHandler(context, dateTime, stockBalance, unitConversion);
        var command = new InventoryAdjustCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.MoveId.Should().NotBeNull().And.NotBe(Guid.Empty);
        result.AdjustmentAmount.Should().Be(-20m);

        var move = await context.StockMoves.FindAsync(result.MoveId!.Value);
        move!.MoveType.Should().Be(StockMoveType.InventoryMinus);
        move.Quantity.Should().Be(100m);
        move.QuantityBase.Should().Be(20m);

        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        balance!.BalanceBase.Should().Be(100m);
    }

    [Fact]
    public async Task InventoryAdjust_NoDifference_ReturnsNullMoveId()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "INV003", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouse.Id,
            ItemId = item.Id,
            BalanceBase = 100m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var handler = new InventoryAdjustHandler(context, dateTime, stockBalance, unitConversion);
        var command = new InventoryAdjustCommand(warehouse.Id, item.Id, null, 100m, "kg", null, null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.MoveId.Should().BeNull();
        result.AdjustmentAmount.Should().Be(0m);

        var moves = await context.StockMoves.ToListAsync();
        moves.Should().BeEmpty();
    }

    [Fact]
    public async Task InventoryAdjust_WarehouseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var handler = new InventoryAdjustHandler(context, dateTime, stockBalance, unitConversion);
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, 100m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
