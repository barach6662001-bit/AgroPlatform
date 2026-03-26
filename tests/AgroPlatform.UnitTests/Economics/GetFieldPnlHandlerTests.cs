using AgroPlatform.Application.Economics.Queries.GetFieldPnl;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Economics;

public class GetFieldPnlHandlerTests
{
    private static AgroPlatform.Application.Common.Interfaces.IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AgroPlatform.UnitTests.TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AgroPlatform.UnitTests.TestDbContext(options);
    }

    [Fact]
    public async Task GetFieldPnl_EmptyDb_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var handler = new GetFieldPnlHandler(context);

        var result = await handler.Handle(new GetFieldPnlQuery(2025, null, null), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetFieldPnl_FieldWithCosts_ReturnsCostSummary()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "North Field", AreaHectares = 100m };
        context.Fields.Add(field);
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Fuel,
            Amount = 10000m,
            Currency = "UAH",
            Date = new DateTime(2025, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Seeds,
            Amount = 5000m,
            Currency = "UAH",
            Date = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        var result = await handler.Handle(new GetFieldPnlQuery(2025, null, null), CancellationToken.None);

        result.Should().HaveCount(1);
        var dto = result[0];
        dto.TotalCosts.Should().Be(15000m);
        dto.CostPerHectare.Should().Be(150m);
        dto.CostsByCategory.Should().ContainKey("Fuel").WhoseValue.Should().Be(10000m);
        dto.CostsByCategory.Should().ContainKey("Seeds").WhoseValue.Should().Be(5000m);
        dto.NetProfit.Should().BeNull(); // no price provided
        dto.EstimatedRevenue.Should().BeNull();
    }

    [Fact]
    public async Task GetFieldPnl_WithYieldAndPrice_CalculatesRevenue()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "South Field", AreaHectares = 50m, CurrentCrop = CropType.Wheat };
        context.Fields.Add(field);
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Fertilizer,
            Amount = 20000m,
            Currency = "UAH",
            Date = new DateTime(2025, 4, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        context.FieldCropHistories.Add(new FieldCropHistory
        {
            FieldId = field.Id,
            Crop = CropType.Wheat,
            Year = 2025,
            YieldPerHectare = 6m,
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        // 6 t/ha * 50 ha * 8000 UAH/t = 2 400 000 revenue
        // net profit = 2 400 000 - 20 000 = 2 380 000
        var result = await handler.Handle(new GetFieldPnlQuery(2025, 8000m, null), CancellationToken.None);

        result.Should().HaveCount(1);
        var dto = result[0];
        dto.ActualYieldPerHectare.Should().Be(6m);
        dto.EstimatedRevenue.Should().Be(2_400_000m);
        dto.NetProfit.Should().Be(2_380_000m);
        dto.RevenuePerHectare.Should().Be(48_000m);
    }

    [Fact]
    public async Task GetFieldPnl_CostsOutsideYear_NotIncluded()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "East Field", AreaHectares = 80m };
        context.Fields.Add(field);
        // In-year cost
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Fuel,
            Amount = 3000m,
            Currency = "UAH",
            Date = new DateTime(2025, 5, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        // Out-of-year cost (2024)
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Fuel,
            Amount = 9999m,
            Currency = "UAH",
            Date = new DateTime(2024, 12, 31, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        var result = await handler.Handle(new GetFieldPnlQuery(2025, null, null), CancellationToken.None);

        result[0].TotalCosts.Should().Be(3000m);
    }

    [Fact]
    public async Task GetFieldPnl_FilterByFieldId_ReturnsSingleField()
    {
        var context = CreateDbContext();
        var field1 = new Field { Name = "Field A", AreaHectares = 10m };
        var field2 = new Field { Name = "Field B", AreaHectares = 20m };
        context.Fields.AddRange(field1, field2);
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Labor,
            Amount = 1000m,
            Currency = "UAH",
            Date = new DateTime(2025, 7, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field1.Id,
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        var result = await handler.Handle(new GetFieldPnlQuery(2025, null, field1.Id), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].FieldId.Should().Be(field1.Id);
    }

    [Fact]
    public async Task GetFieldPnl_NoCosts_ReturnZeroCosts()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Empty Field", AreaHectares = 30m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        var result = await handler.Handle(new GetFieldPnlQuery(2025, null, null), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].TotalCosts.Should().Be(0m);
        result[0].CostsByCategory.Should().BeEmpty();
        result[0].NetProfit.Should().BeNull();
    }

    [Fact]
    public async Task GetFieldPnl_FieldHarvestTakesPriorityOverCropHistory()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Priority Field", AreaHectares = 40m, CurrentCrop = CropType.Corn };
        context.Fields.Add(field);
        // FieldCropHistory with lower yield
        context.FieldCropHistories.Add(new FieldCropHistory
        {
            FieldId = field.Id,
            Crop = CropType.Corn,
            Year = 2025,
            YieldPerHectare = 3m,
        });
        // FieldHarvest with higher yield (should take priority)
        context.FieldHarvests.Add(new FieldHarvest
        {
            FieldId = field.Id,
            Year = 2025,
            CropName = "Corn",
            TotalTons = 320m,
            YieldTonsPerHa = 8m,
            HarvestDate = new DateTime(2025, 9, 1, 0, 0, 0, DateTimeKind.Utc),
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        // 8 t/ha * 40 ha * 5000 UAH/t = 1 600 000 revenue (using FieldHarvest yield)
        var result = await handler.Handle(new GetFieldPnlQuery(2025, 5000m, null), CancellationToken.None);

        result.Should().HaveCount(1);
        var dto = result[0];
        dto.ActualYieldPerHectare.Should().Be(8m); // FieldHarvest wins
        dto.EstimatedRevenue.Should().Be(1_600_000m);
    }

    [Fact]
    public async Task GetFieldPnl_ActualRevenueFromNegativeCostRecord_OverridesEstimate()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Revenue Field", AreaHectares = 50m, CurrentCrop = CropType.Wheat };
        context.Fields.Add(field);
        // Expense
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Fertilizer,
            Amount = 30000m,
            Currency = "UAH",
            Date = new DateTime(2025, 4, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        // Actual revenue stored as negative amount
        context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Other,
            Amount = -120000m,
            Currency = "UAH",
            Date = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            FieldId = field.Id,
        });
        context.FieldCropHistories.Add(new FieldCropHistory
        {
            FieldId = field.Id,
            Crop = CropType.Wheat,
            Year = 2025,
            YieldPerHectare = 4m,
        });
        await context.SaveChangesAsync();

        var handler = new GetFieldPnlHandler(context);
        // Estimated: 4 * 50 * 1000 = 200 000 — but actual revenue (120 000) wins
        var result = await handler.Handle(new GetFieldPnlQuery(2025, 1000m, null), CancellationToken.None);

        result.Should().HaveCount(1);
        var dto = result[0];
        dto.TotalCosts.Should().Be(30000m);   // only expenses
        dto.EstimatedRevenue.Should().Be(120000m); // actual revenue used
        dto.NetProfit.Should().Be(90000m);    // 120 000 - 30 000
        dto.RevenuePerHectare.Should().Be(2400m); // 120 000 / 50
        dto.CostsByCategory.Should().NotContainKey("Revenue"); // negative entries excluded
    }
}
