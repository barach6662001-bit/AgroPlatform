using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.TransferStock;
using AgroPlatform.Application.Warehouses.Services;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Warehouses;

public class TransferStockHandlerTests
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
    public async Task TransferStock_ValidRequest_CreatesTwoMoves()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var source = new Warehouse { Name = "Source", IsActive = true };
        var dest = new Warehouse { Name = "Dest", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "TRF001", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(source);
        context.Warehouses.Add(dest);
        context.WarehouseItems.Add(item);

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = source.Id,
            ItemId = item.Id,
            BalanceBase = 100m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var approvalService = Substitute.For<IApprovalService>();
        approvalService.CheckAndCreateIfRequired(Arg.Any<Domain.Enums.ApprovalActionType>(), Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<decimal>(), Arg.Any<string>(), Arg.Any<string?>(), Arg.Any<CancellationToken>())
            .Returns((false, (Guid?)null));
        var currentUser = Substitute.For<ICurrentUserService>();
        var handler = new TransferStockHandler(context, dateTime, stockBalance, unitConversion, approvalService, currentUser);
        var command = new TransferStockCommand(source.Id, dest.Id, item.Id, null, 60m, "kg", null, null);

        // Act
        var operationId = await handler.Handle(command, CancellationToken.None);

        // Assert
        operationId.Should().NotBeEmpty();

        var moves = await context.StockMoves.Where(m => m.OperationId == operationId).ToListAsync();
        moves.Should().HaveCount(2);
        moves.Should().ContainSingle(m => m.MoveType == StockMoveType.TransferOut && m.WarehouseId == source.Id);
        moves.Should().ContainSingle(m => m.MoveType == StockMoveType.TransferIn && m.WarehouseId == dest.Id);

        var sourceBalance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == source.Id && b.ItemId == item.Id);
        sourceBalance!.BalanceBase.Should().Be(40m);

        var destBalance = await context.StockBalances.FirstOrDefaultAsync(b => b.WarehouseId == dest.Id && b.ItemId == item.Id);
        destBalance!.BalanceBase.Should().Be(60m);
    }

    [Fact]
    public async Task TransferStock_InsufficientBalance_ThrowsException()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var source = new Warehouse { Name = "Source", IsActive = true };
        var dest = new Warehouse { Name = "Dest", IsActive = true };
        var item = new WarehouseItem { Name = "Wheat", Code = "TRF002", Category = "Grain", BaseUnit = "kg" };
        context.Warehouses.Add(source);
        context.Warehouses.Add(dest);
        context.WarehouseItems.Add(item);

        context.StockBalances.Add(new StockBalance
        {
            WarehouseId = source.Id,
            ItemId = item.Id,
            BalanceBase = 10m,
            BaseUnit = "kg",
            LastUpdatedUtc = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var approvalService = Substitute.For<IApprovalService>();
        approvalService.CheckAndCreateIfRequired(Arg.Any<Domain.Enums.ApprovalActionType>(), Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<decimal>(), Arg.Any<string>(), Arg.Any<string?>(), Arg.Any<CancellationToken>())
            .Returns((false, (Guid?)null));
        var currentUser = Substitute.For<ICurrentUserService>();
        var handler = new TransferStockHandler(context, dateTime, stockBalance, unitConversion, approvalService, currentUser);
        var command = new TransferStockCommand(source.Id, dest.Id, item.Id, null, 50m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InsufficientBalanceException>();
    }

    [Fact]
    public async Task TransferStock_SourceWarehouseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();

        var approvalService = Substitute.For<IApprovalService>();
        approvalService.CheckAndCreateIfRequired(Arg.Any<Domain.Enums.ApprovalActionType>(), Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<decimal>(), Arg.Any<string>(), Arg.Any<string?>(), Arg.Any<CancellationToken>())
            .Returns((false, (Guid?)null));
        var currentUser = Substitute.For<ICurrentUserService>();
        var handler = new TransferStockHandler(context, dateTime, stockBalance, unitConversion, approvalService, currentUser);
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, 10m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task TransferStock_SameWarehouse_ThrowsConflictException()
    {
        // Arrange
        var (context, dateTime, stockBalance, unitConversion) = CreateDependencies();
        var sameId = Guid.NewGuid();

        var approvalService = Substitute.For<IApprovalService>();
        approvalService.CheckAndCreateIfRequired(Arg.Any<Domain.Enums.ApprovalActionType>(), Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<decimal>(), Arg.Any<string>(), Arg.Any<string?>(), Arg.Any<CancellationToken>())
            .Returns((false, (Guid?)null));
        var currentUser = Substitute.For<ICurrentUserService>();
        var handler = new TransferStockHandler(context, dateTime, stockBalance, unitConversion, approvalService, currentUser);
        var command = new TransferStockCommand(sameId, sameId, Guid.NewGuid(), null, 10m, "kg", null, null);

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>().WithMessage("*different*");
    }
}
