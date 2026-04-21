using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;
using AgroPlatform.Application.Fuel.Commands.CreateFuelSupply;
using AgroPlatform.Application.Fuel.Commands.CreateFuelTank;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.UnitTests.TestDoubles;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Fuel;

public class FuelHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateFuelTank ────────────────────────────────────────────────────

    [Fact]
    public async Task CreateFuelTank_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateFuelTankHandler(context);
        var command = new CreateFuelTankCommand("Main Tank", FuelType.Diesel, 5000m);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateFuelTank_ValidCommand_InitializesCurrentLitersToZero()
    {
        var context = CreateDbContext();
        var handler = new CreateFuelTankHandler(context);
        var command = new CreateFuelTankCommand("Diesel Tank", FuelType.Diesel, 3000m);

        var id = await handler.Handle(command, CancellationToken.None);

        var tank = await ((TestDbContext)context).FuelTanks.FindAsync(id);
        tank.Should().NotBeNull();
        tank!.CurrentLiters.Should().Be(0);
        tank.IsActive.Should().BeTrue();
        tank.CapacityLiters.Should().Be(3000m);
        tank.FuelType.Should().Be(FuelType.Diesel);
    }

    // ── CreateFuelSupply ──────────────────────────────────────────────────

    [Fact]
    public async Task CreateFuelSupply_ValidTank_IncreasesCurrentLiters()
    {
        var context = CreateDbContext();
        var tank = new FuelTank
        {
            Name = "Supply Tank",
            FuelType = FuelType.Diesel,
            CapacityLiters = 1000m,
            CurrentLiters = 200m,
            IsActive = true,
        };
        context.FuelTanks.Add(tank);
        await context.SaveChangesAsync();

        var handler = new CreateFuelSupplyHandler(context);
        var command = new CreateFuelSupplyCommand(tank.Id, 300m, 45m, DateTime.Today, "Supplier A", null, null);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).FuelTanks.FindAsync(tank.Id);
        updated!.CurrentLiters.Should().Be(500m); // 200 + 300
    }

    [Fact]
    public async Task CreateFuelSupply_WithPrice_CalculatesTotalCost()
    {
        var context = CreateDbContext();
        var tank = new FuelTank
        {
            Name = "Price Tank",
            FuelType = FuelType.Gasoline,
            CapacityLiters = 500m,
            CurrentLiters = 0m,
            IsActive = true,
        };
        context.FuelTanks.Add(tank);
        await context.SaveChangesAsync();

        var handler = new CreateFuelSupplyHandler(context);
        var command = new CreateFuelSupplyCommand(tank.Id, 100m, 50m, DateTime.Today, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var transaction = await ((TestDbContext)context).FuelTransactions.FindAsync(id);
        transaction.Should().NotBeNull();
        transaction!.TransactionType.Should().Be("Supply");
        transaction.TotalCost.Should().Be(5000m); // 100L × 50 UAH
    }

    [Fact]
    public async Task CreateFuelSupply_NonExistentTank_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateFuelSupplyHandler(context);
        var command = new CreateFuelSupplyCommand(Guid.NewGuid(), 100m, null, DateTime.Today, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── CreateFuelIssue ───────────────────────────────────────────────────

    [Fact]
    public async Task CreateFuelIssue_SufficientFuel_DecreasesCurrentLiters()
    {
        var context = CreateDbContext();
        var notifications = Substitute.For<INotificationService>();
        var currentUser = new FakeCurrentUserService { TenantId = Guid.NewGuid() };

        var tank = new FuelTank
        {
            Name = "Issue Tank",
            FuelType = FuelType.Diesel,
            CapacityLiters = 1000m,
            CurrentLiters = 500m,
            IsActive = true,
        };
        context.FuelTanks.Add(tank);
        await context.SaveChangesAsync();

        var handler = new CreateFuelIssueHandler(context, notifications, currentUser);
        var command = new CreateFuelIssueCommand(tank.Id, 100m, DateTime.Today, null, null, "Driver A", null);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).FuelTanks.FindAsync(tank.Id);
        updated!.CurrentLiters.Should().Be(400m); // 500 - 100
    }

    [Fact]
    public async Task CreateFuelIssue_InsufficientFuel_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var notifications = Substitute.For<INotificationService>();
        var currentUser = new FakeCurrentUserService { TenantId = Guid.NewGuid() };

        var tank = new FuelTank
        {
            Name = "Low Tank",
            FuelType = FuelType.Diesel,
            CapacityLiters = 1000m,
            CurrentLiters = 50m,
            IsActive = true,
        };
        context.FuelTanks.Add(tank);
        await context.SaveChangesAsync();

        var handler = new CreateFuelIssueHandler(context, notifications, currentUser);
        var command = new CreateFuelIssueCommand(tank.Id, 100m, DateTime.Today, null, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task CreateFuelIssue_NonExistentTank_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var notifications = Substitute.For<INotificationService>();
        var currentUser = new FakeCurrentUserService { TenantId = Guid.NewGuid() };

        var handler = new CreateFuelIssueHandler(context, notifications, currentUser);
        var command = new CreateFuelIssueCommand(Guid.NewGuid(), 100m, DateTime.Today, null, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateFuelIssue_WithKnownPrice_CreatesCostRecord()
    {
        var context = CreateDbContext();
        var notifications = Substitute.For<INotificationService>();
        var currentUser = new FakeCurrentUserService { TenantId = Guid.NewGuid() };

        var tank = new FuelTank
        {
            Name = "Cost Tank",
            FuelType = FuelType.Diesel,
            CapacityLiters = 1000m,
            CurrentLiters = 500m,
            PricePerLiter = 45m,
            IsActive = true,
        };
        context.FuelTanks.Add(tank);
        await context.SaveChangesAsync();

        var handler = new CreateFuelIssueHandler(context, notifications, currentUser);
        var command = new CreateFuelIssueCommand(tank.Id, 100m, DateTime.Today, null, null, null, null);

        await handler.Handle(command, CancellationToken.None);

        var costRecord = await ((TestDbContext)context).CostRecords
            .FirstOrDefaultAsync(c => c.Category == CostCategory.Fuel);
        costRecord.Should().NotBeNull();
        costRecord!.Amount.Should().Be(4500m); // 100L × 45 UAH/L
    }
}
