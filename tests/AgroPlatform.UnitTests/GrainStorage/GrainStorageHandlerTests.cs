using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.TransferGrain;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
// ReSharper disable MethodHasAsyncOverload

namespace AgroPlatform.UnitTests.GrainStorage;

public class GrainStorageHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
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
            GrainType = "Corn",
            QuantityTons = 100m,
            InitialQuantityTons = 100m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(batch.Id, GrainMovementType.Receipt, 50m, DateTime.Today, "New harvest", null);

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
            GrainType = "Barley",
            QuantityTons = 200m,
            InitialQuantityTons = 200m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(
            batch.Id, GrainMovementType.SaleDispatch, 80m, DateTime.Today, "Sale", null, 8000m, "Buyer Co");

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
            GrainType = "Wheat",
            QuantityTons = 300m,
            InitialQuantityTons = 300m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(
            batch.Id, GrainMovementType.SaleDispatch, 100m, DateTime.Today, "Export", null, 7500m, null);

        await handler.Handle(command, CancellationToken.None);

        var costRecord = await ((TestDbContext)context).CostRecords
            .FirstOrDefaultAsync(c => c.Category == CostCategory.Other);
        costRecord.Should().NotBeNull();
        costRecord!.Amount.Should().Be(-750000m); // -100t × 7500 UAH/t (negative = income)
        costRecord.Currency.Should().Be("UAH");
    }

    [Fact]
    public async Task CreateGrainMovement_NonExistentBatch_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateGrainMovementHandler(context);
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), GrainMovementType.Issue, 50m, DateTime.Today, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── SplitGrainBatch ───────────────────────────────────────────────────

    private static async Task<(GrainBatch batch, Domain.GrainStorage.GrainStorage storage1, Domain.GrainStorage.GrainStorage storage2)>
        CreateSplitFixture(IAppDbContext context)
    {
        var storage1 = new Domain.GrainStorage.GrainStorage { Name = "Silo A", IsActive = true };
        var storage2 = new Domain.GrainStorage.GrainStorage { Name = "Silo B", IsActive = true };
        ((TestDbContext)context).GrainStorages.AddRange(storage1, storage2);

        var batch = new GrainBatch
        {
            GrainType = "Wheat",
            QuantityTons = 400m,
            InitialQuantityTons = 400m,
            ReceivedDate = DateTime.Today,
            OwnershipType = GrainOwnershipType.Own,
        };
        context.GrainBatches.Add(batch);
        context.GrainBatchPlacements.Add(new GrainBatchPlacement
        {
            GrainBatchId = batch.Id,
            GrainStorageId = storage1.Id,
            QuantityTons = 400m,
        });
        await context.SaveChangesAsync();
        return (batch, storage1, storage2);
    }

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_ReducesSourceQuantity()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(batch.Id, 150m, storage2.Id);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updated!.QuantityTons.Should().Be(250m); // 400 - 150
    }

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_CreatesNewBatchAtTarget()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(batch.Id, 100m, storage2.Id, "test split");

        var newBatchId = await handler.Handle(command, CancellationToken.None);

        newBatchId.Should().NotBeEmpty();

        var newBatch = await ((TestDbContext)context).GrainBatches.FindAsync(newBatchId);
        newBatch.Should().NotBeNull();
        newBatch!.GrainType.Should().Be("Wheat");
        newBatch.QuantityTons.Should().Be(100m);
        newBatch.Notes.Should().Be("test split");

        var newBatchPlacement = await ((TestDbContext)context).GrainBatchPlacements
            .FirstOrDefaultAsync(p => p.GrainBatchId == newBatchId);
        newBatchPlacement.Should().NotBeNull();
        newBatchPlacement!.GrainStorageId.Should().Be(storage2.Id);

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updatedSource!.QuantityTons.Should().Be(300m);
    }

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_CreatesMovementRecords()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(batch.Id, 80m, storage2.Id);

        var newBatchId = await handler.Handle(command, CancellationToken.None);

        var outMovement = await ((TestDbContext)context).GrainMovements
            .FirstOrDefaultAsync(m => m.GrainBatchId == batch.Id && m.MovementType == GrainMovementType.Split);
        outMovement.Should().NotBeNull();
        outMovement!.QuantityTons.Should().Be(80m);
        outMovement.TargetBatchId.Should().Be(newBatchId);

        var inMovement = await ((TestDbContext)context).GrainMovements
            .FirstOrDefaultAsync(m => m.GrainBatchId == newBatchId && m.MovementType == GrainMovementType.Split);
        inMovement.Should().NotBeNull();
        inMovement!.QuantityTons.Should().Be(80m);
        inMovement.OperationId.Should().Be(outMovement.OperationId);
    }

    [Fact]
    public async Task SplitGrainBatch_TwoConsecutiveSplits_DistributesCorrectly()
    {
        var context = CreateDbContext();
        var storage2 = new Domain.GrainStorage.GrainStorage { Name = "Silo B", IsActive = true };
        var storage3 = new Domain.GrainStorage.GrainStorage { Name = "Silo C", IsActive = true };
        ((TestDbContext)context).GrainStorages.AddRange(storage2, storage3);

        var batch = new GrainBatch
        {
            GrainType = "Corn",
            QuantityTons = 300m,
            InitialQuantityTons = 300m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new SplitGrainBatchHandler(context);
        await handler.Handle(new SplitGrainBatchCommand(batch.Id, 100m, storage2.Id), CancellationToken.None);
        await handler.Handle(new SplitGrainBatchCommand(batch.Id, 120m, storage3.Id), CancellationToken.None);

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updatedSource!.QuantityTons.Should().Be(80m); // 300 - 100 - 120
    }

    [Fact]
    public async Task SplitGrainBatch_ExceedsAvailableQuantity_ThrowsInvalidOperationException()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(batch.Id, 999m, storage2.Id);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task SplitGrainBatch_NonExistentBatch_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(Guid.NewGuid(), 10m, Guid.NewGuid());

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── TransferGrain ─────────────────────────────────────────────────────

    private static async Task<(GrainBatch source, GrainBatch target)> CreateTwoBatches(IAppDbContext context)
    {
        var source = new GrainBatch
        {
            GrainType = "Wheat",
            QuantityTons = 200m,
            InitialQuantityTons = 200m,
            ReceivedDate = DateTime.Today,
        };
        var target = new GrainBatch
        {
            GrainType = "Wheat",
            QuantityTons = 50m,
            InitialQuantityTons = 50m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(source);
        context.GrainBatches.Add(target);
        await context.SaveChangesAsync();
        return (source, target);
    }

    [Fact]
    public async Task TransferGrain_ValidTransfer_ReducesSourceAndIncreasesTarget()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, 80m, null, "Test transfer");
        await handler.Handle(command, CancellationToken.None);

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(source.Id);
        var updatedTarget = await ((TestDbContext)context).GrainBatches.FindAsync(target.Id);

        updatedSource!.QuantityTons.Should().Be(120m); // 200 - 80
        updatedTarget!.QuantityTons.Should().Be(130m); // 50 + 80
    }

    [Fact]
    public async Task TransferGrain_ValidTransfer_ReturnsOperationId()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, 30m, null, "Notes");
        var operationId = await handler.Handle(command, CancellationToken.None);

        operationId.Should().NotBeEmpty();
    }

    [Fact]
    public async Task TransferGrain_ValidTransfer_CreatesPairedMovementsLinkedByOperationId()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, 40m);
        var operationId = await handler.Handle(command, CancellationToken.None);

        var movements = await ((TestDbContext)context).GrainMovements
            .Where(m => m.OperationId == operationId)
            .ToListAsync();

        movements.Should().HaveCount(2);
        movements.Should().ContainSingle(m => m.MovementType == GrainMovementType.Transfer && m.GrainBatchId == source.Id);
        movements.Should().ContainSingle(m => m.MovementType == GrainMovementType.Transfer && m.GrainBatchId == target.Id);
    }

    [Fact]
    public async Task TransferGrain_InsufficientQuantity_ThrowsInvalidOperationException()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, 999m);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Insufficient*");
    }

    [Fact]
    public async Task TransferGrain_NonExistentSource_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var (_, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(Guid.NewGuid(), target.Id, 10m);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task TransferGrain_NonExistentTarget_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var (source, _) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, Guid.NewGuid(), 10m);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}