using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.GrainStorage;

public class GrainStorageHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateGrainBatch ──────────────────────────────────────────────────

    [Fact]
    public async Task CreateGrainBatch_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateGrainBatchHandler(context);
        var command = new CreateGrainBatchCommand(
            Guid.NewGuid(), "Wheat", 100m, GrainOwnershipType.Own,
            null, null, 5000m, DateTime.Today, null, 14m, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateGrainBatch_ValidCommand_SetsQuantityTonsToInitialValue()
    {
        var context = CreateDbContext();
        var handler = new CreateGrainBatchHandler(context);
        var command = new CreateGrainBatchCommand(
            Guid.NewGuid(), "Sunflower", 250m, GrainOwnershipType.Own,
            null, null, null, DateTime.Today, null, null, "Test notes");

        var id = await handler.Handle(command, CancellationToken.None);

        var batch = await ((TestDbContext)context).GrainBatches.FindAsync(id);
        batch.Should().NotBeNull();
        batch!.QuantityTons.Should().Be(250m);
        batch.InitialQuantityTons.Should().Be(250m);
        batch.GrainType.Should().Be("Sunflower");
        batch.Notes.Should().Be("Test notes");
    }

    [Fact]
    public async Task CreateGrainBatch_WithOwnershipType_PersistsOwnershipType()
    {
        var context = CreateDbContext();
        var handler = new CreateGrainBatchHandler(context);
        var command = new CreateGrainBatchCommand(
            Guid.NewGuid(), "Corn", 80m, GrainOwnershipType.Consignment,
            "Owner Corp", "CONTRACT-001", 4000m, DateTime.Today, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var batch = await ((TestDbContext)context).GrainBatches.FindAsync(id);
        batch!.OwnershipType.Should().Be(GrainOwnershipType.Consignment);
        batch.OwnerName.Should().Be("Owner Corp");
        batch.ContractNumber.Should().Be("CONTRACT-001");
        batch.PricePerTon.Should().Be(4000m);
    }

    // ── CreateGrainMovement ───────────────────────────────────────────────

    [Fact]
    public async Task CreateGrainMovement_InMovement_IncreasesBatchQuantity()
    {
        var context = CreateDbContext();
        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Corn",
            QuantityTons = 100m,
            InitialQuantityTons = 100m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(batch.Id, "In", 50m, DateTime.Today, "New harvest", null);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updated!.QuantityTons.Should().Be(150m); // 100 + 50
    }

    [Fact]
    public async Task CreateGrainMovement_OutMovement_DecreasesBatchQuantity()
    {
        var context = CreateDbContext();
        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Barley",
            QuantityTons = 200m,
            InitialQuantityTons = 200m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(
            batch.Id, "Out", 80m, DateTime.Today, "Sale", null, 8000m, "Buyer Co");

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updated!.QuantityTons.Should().Be(120m); // 200 - 80
    }

    [Fact]
    public async Task CreateGrainMovement_OutMovementWithPrice_CreatesRevenueRecord()
    {
        var context = CreateDbContext();
        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Wheat",
            QuantityTons = 300m,
            InitialQuantityTons = 300m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(
            batch.Id, "Out", 100m, DateTime.Today, "Export", null, 7500m, null);

        await handler.Handle(command, CancellationToken.None);

        var costRecord = await ((TestDbContext)context).CostRecords
            .FirstOrDefaultAsync(c => c.Category == "Revenue");
        costRecord.Should().NotBeNull();
        costRecord!.Amount.Should().Be(-750000m); // -100t × 7500 UAH/t (negative = income)
        costRecord.Currency.Should().Be("UAH");
    }

    [Fact]
    public async Task CreateGrainMovement_NonExistentBatch_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), "Out", 50m, DateTime.Today, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
