using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Services;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Warehouses;

public class StockBalanceServiceTests
{
    private static (TestDbContext context, StockBalanceService service) CreateDependencies()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new TestDbContext(options);
        var dateTime = Substitute.For<IDateTimeService>();
        dateTime.UtcNow.Returns(DateTime.UtcNow);
        var service = new StockBalanceService(context, dateTime);
        return (context, service);
    }

    [Fact]
    public async Task IncreaseBalance_NewBalance_CreatesRecord()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        // Act
        await service.IncreaseBalance(warehouseId, itemId, null, 50m, "kg", CancellationToken.None);
        await context.SaveChangesAsync();

        // Assert
        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ItemId == itemId);
        balance.Should().NotBeNull();
        balance!.BalanceBase.Should().Be(50m);
        balance.BaseUnit.Should().Be("kg");
    }

    [Fact]
    public async Task IncreaseBalance_ExistingBalance_AddsQuantity()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouseId,
            ItemId = itemId,
            BalanceBase = 100m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        await service.IncreaseBalance(warehouseId, itemId, null, 30m, "kg", CancellationToken.None);
        await context.SaveChangesAsync();

        // Assert
        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ItemId == itemId);
        balance!.BalanceBase.Should().Be(130m);
    }

    [Fact]
    public async Task DecreaseBalance_SufficientBalance_SubtractsQuantity()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouseId,
            ItemId = itemId,
            BalanceBase = 100m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        await service.DecreaseBalance(warehouseId, itemId, null, 40m, CancellationToken.None);
        await context.SaveChangesAsync();

        // Assert
        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ItemId == itemId);
        balance!.BalanceBase.Should().Be(60m);
    }

    [Fact]
    public async Task DecreaseBalance_InsufficientBalance_ThrowsException()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouseId,
            ItemId = itemId,
            BalanceBase = 10m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        var act = () => service.DecreaseBalance(warehouseId, itemId, null, 50m, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InsufficientBalanceException>();
    }

    [Fact]
    public async Task DecreaseBalance_NoBalance_ThrowsInsufficientBalanceException()
    {
        // Arrange
        var (context, service) = CreateDependencies();

        // Act
        var act = () => service.DecreaseBalance(Guid.NewGuid(), Guid.NewGuid(), null, 10m, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InsufficientBalanceException>();
    }

    [Fact]
    public async Task SetBalance_NewBalance_CreatesRecord()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        // Act
        await service.SetBalance(warehouseId, itemId, null, 75m, "kg", CancellationToken.None);
        await context.SaveChangesAsync();

        // Assert
        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ItemId == itemId);
        balance.Should().NotBeNull();
        balance!.BalanceBase.Should().Be(75m);
    }

    [Fact]
    public async Task SetBalance_ExistingBalance_SetsExactQuantity()
    {
        // Arrange
        var (context, service) = CreateDependencies();
        var warehouseId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = warehouseId,
            ItemId = itemId,
            BalanceBase = 200m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        await service.SetBalance(warehouseId, itemId, null, 50m, "kg", CancellationToken.None);
        await context.SaveChangesAsync();

        // Assert
        var balance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ItemId == itemId);
        balance!.BalanceBase.Should().Be(50m);
    }
}
