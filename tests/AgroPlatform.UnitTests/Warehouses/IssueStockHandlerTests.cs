using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.IssueStock;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Warehouses;

public class IssueStockHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task Handle_SufficientBalance_CreatesIssueAndDecreasesBalance()
    {
        // Arrange
        var context = CreateDbContext();
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "ISSUE001", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);

        var balance = new StockBalance
        {
            WarehouseId = warehouse.Id,
            ItemId = item.Id,
            BalanceBase = 200m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        };
        context.StockBalances.Add(balance);
        await context.SaveChangesAsync();

        var handler = new IssueStockHandler(context, dateTime);
        var command = new IssueStockCommand(warehouse.Id, item.Id, null, 50m, "kg", null);

        // Act
        var moveId = await handler.Handle(command, CancellationToken.None);

        // Assert
        moveId.Should().NotBeEmpty();

        var updatedBalance = await ((TestDbContext)context).StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        updatedBalance!.BalanceBase.Should().Be(150m);
    }

    [Fact]
    public async Task Handle_InsufficientBalance_ThrowsConflictException()
    {
        // Arrange
        var context = CreateDbContext();
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "ISSUE002", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);

        var balance = new StockBalance
        {
            WarehouseId = warehouse.Id,
            ItemId = item.Id,
            BalanceBase = 10m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        };
        context.StockBalances.Add(balance);
        await context.SaveChangesAsync();

        var handler = new IssueStockHandler(context, dateTime);
        var command = new IssueStockCommand(warehouse.Id, item.Id, null, 50m, "kg", null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>().WithMessage("*Insufficient*");
    }

    [Fact]
    public async Task Handle_NoBalance_ThrowsConflictException()
    {
        // Arrange
        var context = CreateDbContext();
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);

        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "ISSUE003", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(warehouse);
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new IssueStockHandler(context, dateTime);
        var command = new IssueStockCommand(warehouse.Id, item.Id, null, 10m, "kg", null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
    }
}
