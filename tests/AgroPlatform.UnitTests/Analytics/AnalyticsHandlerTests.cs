using AgroPlatform.Application.Analytics.Queries.GetDashboard;
using AgroPlatform.Application.Analytics.Queries.GetFieldEfficiency;
using AgroPlatform.Application.Analytics.Queries.GetResourceConsumption;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Analytics;

public class AnalyticsHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── GetDashboard ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDashboard_EmptyDb_ReturnsZeroedDto()
    {
        var context = CreateDbContext();
        var handler = new GetDashboardHandler(context);

        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.Should().NotBeNull();
        result.TotalFields.Should().Be(0);
        result.TotalAreaHectares.Should().Be(0);
        result.TotalWarehouses.Should().Be(0);
        result.TotalOperations.Should().Be(0);
        result.TotalMachines.Should().Be(0);
        result.TotalCosts.Should().Be(0);
        result.TopStockItems.Should().BeEmpty();
        result.CostTrend.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDashboard_WithFields_SummarisesCorrectly()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "F1", AreaHectares = 100m, CurrentCrop = CropType.Wheat });
        context.Fields.Add(new Field { Name = "F2", AreaHectares = 50m, CurrentCrop = CropType.Corn });
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TotalFields.Should().Be(2);
        result.TotalAreaHectares.Should().Be(150m);
        result.AreaByCrop.Should().ContainKey("Wheat").WhoseValue.Should().Be(100m);
        result.AreaByCrop.Should().ContainKey("Corn").WhoseValue.Should().Be(50m);
    }

    [Fact]
    public async Task GetDashboard_DeletedFieldsExcluded()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Active", AreaHectares = 80m });
        context.Fields.Add(new Field { Name = "Deleted", AreaHectares = 200m, IsDeleted = true });
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TotalFields.Should().Be(1);
        result.TotalAreaHectares.Should().Be(80m);
    }

    [Fact]
    public async Task GetDashboard_WithOperations_CountsCorrectly()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "F1", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        context.AgroOperations.Add(new AgroOperation
        {
            FieldId = field.Id,
            OperationType = AgroOperationType.Sowing,
            PlannedDate = DateTime.UtcNow,
            IsCompleted = true
        });
        context.AgroOperations.Add(new AgroOperation
        {
            FieldId = field.Id,
            OperationType = AgroOperationType.Harvesting,
            PlannedDate = DateTime.UtcNow,
            IsCompleted = false
        });
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TotalOperations.Should().Be(2);
        result.CompletedOperations.Should().Be(1);
        result.PendingOperations.Should().Be(1);
        result.OperationsByType.Should().ContainKey("Sowing");
        result.OperationsByType.Should().ContainKey("Harvesting");
    }

    [Fact]
    public async Task GetDashboard_WithMachinery_SummarisesCorrectly()
    {
        var context = CreateDbContext();
        var machine = new Machine
        {
            Name = "Tractor",
            InventoryNumber = "T-001",
            Type = MachineryType.Tractor,
            Status = MachineryStatus.Active,
            FuelType = FuelType.Diesel
        };
        context.Machines.Add(machine);
        await context.SaveChangesAsync();

        context.MachineWorkLogs.Add(new MachineWorkLog
        {
            MachineId = machine.Id,
            Date = DateTime.UtcNow,
            HoursWorked = 8m
        });
        context.FuelLogs.Add(new FuelLog
        {
            MachineId = machine.Id,
            Date = DateTime.UtcNow,
            Quantity = 50m,
            FuelType = FuelType.Diesel
        });
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TotalMachines.Should().Be(1);
        result.ActiveMachines.Should().Be(1);
        result.UnderRepairMachines.Should().Be(0);
        result.TotalHoursWorked.Should().Be(8m);
        result.TotalFuelConsumed.Should().Be(50m);
    }

    [Fact]
    public async Task GetDashboard_WithCostRecords_SummarisesAndTrends()
    {
        var context = CreateDbContext();
        var now = DateTime.UtcNow;
        context.CostRecords.Add(new CostRecord { Category = "Seeds", Amount = 1000m, Currency = "UAH", Date = now });
        context.CostRecords.Add(new CostRecord { Category = "Fuel", Amount = 500m, Currency = "UAH", Date = now.AddMonths(-1) });
        context.CostRecords.Add(new CostRecord { Category = "Seeds", Amount = 200m, Currency = "UAH", Date = now.AddMonths(-13) }); // outside 12-month window
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TotalCosts.Should().Be(1700m);
        result.CostsByCategory.Should().ContainKey("Seeds").WhoseValue.Should().Be(1200m);
        result.CostsByCategory.Should().ContainKey("Fuel").WhoseValue.Should().Be(500m);
        result.CostTrend.Should().HaveCount(2); // only last 12 months
    }

    [Fact]
    public async Task GetDashboard_TopStockItems_ReturnsTop10()
    {
        var context = CreateDbContext();
        var warehouse = new Warehouse { Name = "WH1", Location = "Loc1" };
        context.Warehouses.Add(warehouse);
        await context.SaveChangesAsync();

        for (int i = 1; i <= 12; i++)
        {
            var item = new WarehouseItem { Name = $"Item{i}", Code = $"I{i:D2}", Category = "Cat", BaseUnit = "kg" };
            context.WarehouseItems.Add(item);
            await context.SaveChangesAsync();

            context.StockBalances.Add(new StockBalance
            {
                WarehouseId = warehouse.Id,
                ItemId = item.Id,
                BalanceBase = i * 10m,
                BaseUnit = "kg",
                LastUpdatedUtc = DateTime.UtcNow
            });
        }
        await context.SaveChangesAsync();

        var handler = new GetDashboardHandler(context);
        var result = await handler.Handle(new GetDashboardQuery(), CancellationToken.None);

        result.TopStockItems.Should().HaveCount(10);
        result.TopStockItems.First().TotalBalance.Should().Be(120m); // highest item (item 12 × 10)
    }

    // ── GetResourceConsumption ───────────────────────────────────────────────

    [Fact]
    public async Task GetResourceConsumption_EmptyDb_ReturnsEmpty()
    {
        var context = CreateDbContext();
        var handler = new GetResourceConsumptionHandler(context);

        var result = await handler.Handle(new GetResourceConsumptionQuery(null, null, null), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetResourceConsumption_WithResources_AggregatesCorrectly()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "F1", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var operation = new AgroOperation
        {
            FieldId = field.Id,
            OperationType = AgroOperationType.Sowing,
            PlannedDate = DateTime.UtcNow
        };
        context.AgroOperations.Add(operation);
        await context.SaveChangesAsync();

        var item = new WarehouseItem { Name = "Seeds", Code = "SDS", Category = "Seeds", BaseUnit = "kg" };
        var warehouse = new Warehouse { Name = "WH1", Location = "L1" };
        context.WarehouseItems.Add(item);
        context.Warehouses.Add(warehouse);
        await context.SaveChangesAsync();

        context.AgroOperationResources.Add(new AgroOperationResource
        {
            AgroOperationId = operation.Id,
            WarehouseItemId = item.Id,
            WarehouseId = warehouse.Id,
            PlannedQuantity = 100m,
            ActualQuantity = 95m,
            UnitCode = "kg"
        });
        await context.SaveChangesAsync();

        var handler = new GetResourceConsumptionHandler(context);
        var result = await handler.Handle(new GetResourceConsumptionQuery(null, null, null), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].ItemName.Should().Be("Seeds");
        result[0].TotalConsumed.Should().Be(95m);
    }

    // ── GetFieldEfficiency ───────────────────────────────────────────────────

    [Fact]
    public async Task GetFieldEfficiency_EmptyDb_ReturnsEmpty()
    {
        var context = CreateDbContext();
        var handler = new GetFieldEfficiencyHandler(context);

        var result = await handler.Handle(new GetFieldEfficiencyQuery(), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetFieldEfficiency_WithFieldAndCosts_CalculatesCostPerHectare()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "TestField", AreaHectares = 50m, CurrentCrop = CropType.Wheat };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        context.CostRecords.Add(new CostRecord
        {
            Category = "Seeds",
            Amount = 500m,
            Currency = "UAH",
            Date = DateTime.UtcNow,
            FieldId = field.Id
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldEfficiencyHandler(context);
        var result = await handler.Handle(new GetFieldEfficiencyQuery(), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].FieldName.Should().Be("TestField");
        result[0].TotalCosts.Should().Be(500m);
        result[0].CostPerHectare.Should().Be(10m); // 500 / 50
        result[0].CurrentCrop.Should().Be("Wheat");
    }

    [Fact]
    public async Task GetFieldEfficiency_DeletedFieldsExcluded()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Active", AreaHectares = 10m });
        context.Fields.Add(new Field { Name = "Deleted", AreaHectares = 100m, IsDeleted = true });
        await context.SaveChangesAsync();

        var handler = new GetFieldEfficiencyHandler(context);
        var result = await handler.Handle(new GetFieldEfficiencyQuery(), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].FieldName.Should().Be("Active");
    }
}
