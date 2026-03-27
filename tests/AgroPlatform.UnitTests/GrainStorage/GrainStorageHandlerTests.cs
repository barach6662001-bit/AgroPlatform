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
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), "Out", 50m, DateTime.Today, null, null);

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
            GrainStorageId = storage1.Id,
            GrainType = "Wheat",
            QuantityTons = 400m,
            InitialQuantityTons = 400m,
            ReceivedDate = DateTime.Today,
            OwnershipType = GrainOwnershipType.Own,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();
        return (batch, storage1, storage2);
    }

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_ReducesSourceQuantity()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(storage2.Id, 150m) },
            null);

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
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(storage2.Id, 100m) },
            "test split");

        var result = await handler.Handle(command, CancellationToken.None);

        result.CreatedBatches.Should().HaveCount(1);
        result.CreatedBatches[0].QuantityTons.Should().Be(100m);
        result.CreatedBatches[0].TargetStorageId.Should().Be(storage2.Id);
        result.RemainingQuantityTons.Should().Be(300m);

        var newBatch = await ((TestDbContext)context).GrainBatches.FindAsync(result.CreatedBatches[0].NewBatchId);
        newBatch.Should().NotBeNull();
        newBatch!.GrainType.Should().Be("Wheat");
        newBatch.GrainStorageId.Should().Be(storage2.Id);
        newBatch.QuantityTons.Should().Be(100m);
        newBatch.Notes.Should().Be("test split");
    }

    [Fact]
    public async Task SplitGrainBatch_ValidSplit_CreatesMovementRecords()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(storage2.Id, 80m) },
            null);

        var result = await handler.Handle(command, CancellationToken.None);

        var outMovement = await ((TestDbContext)context).GrainMovements
            .FirstOrDefaultAsync(m => m.GrainBatchId == batch.Id && m.MovementType == "Out");
        outMovement.Should().NotBeNull();
        outMovement!.QuantityTons.Should().Be(80m);
        outMovement.Reason.Should().Be("Split");

        var inMovement = await ((TestDbContext)context).GrainMovements
            .FirstOrDefaultAsync(m => m.GrainBatchId == result.CreatedBatches[0].NewBatchId && m.MovementType == "In");
        inMovement.Should().NotBeNull();
        inMovement!.QuantityTons.Should().Be(80m);
        inMovement.Reason.Should().Be("Split");
    }

    [Fact]
    public async Task SplitGrainBatch_MultipleTargets_DistributesCorrectly()
    {
        var context = CreateDbContext();
        var storage2 = new Domain.GrainStorage.GrainStorage { Name = "Silo B", IsActive = true };
        var storage3 = new Domain.GrainStorage.GrainStorage { Name = "Silo C", IsActive = true };
        ((TestDbContext)context).GrainStorages.AddRange(storage2, storage3);

        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Corn",
            QuantityTons = 300m,
            InitialQuantityTons = 300m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(storage2.Id, 100m), new(storage3.Id, 120m) },
            null);

        var result = await handler.Handle(command, CancellationToken.None);

        result.CreatedBatches.Should().HaveCount(2);
        result.RemainingQuantityTons.Should().Be(80m); // 300 - 100 - 120

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(batch.Id);
        updatedSource!.QuantityTons.Should().Be(80m);
    }

    [Fact]
    public async Task SplitGrainBatch_ExceedsAvailableQuantity_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var (batch, _, storage2) = await CreateSplitFixture(context);

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(storage2.Id, 999m) },
            null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task SplitGrainBatch_NonExistentBatch_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var storage = new Domain.GrainStorage.GrainStorage { Name = "Silo", IsActive = true };
        ((TestDbContext)context).GrainStorages.Add(storage);
        await context.SaveChangesAsync();

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            Guid.NewGuid(),
            new List<SplitTarget> { new(storage.Id, 10m) },
            null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task SplitGrainBatch_InactiveTargetStorage_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var inactiveStorage = new Domain.GrainStorage.GrainStorage { Name = "Closed Silo", IsActive = false };
        ((TestDbContext)context).GrainStorages.Add(inactiveStorage);

        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Barley",
            QuantityTons = 100m,
            InitialQuantityTons = 100m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(inactiveStorage.Id, 50m) },
            null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task SplitGrainBatch_NonExistentTargetStorage_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var batch = new GrainBatch
        {
            GrainStorageId = Guid.NewGuid(),
            GrainType = "Sunflower",
            QuantityTons = 200m,
            InitialQuantityTons = 200m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(batch);
        await context.SaveChangesAsync();

        var handler = new SplitGrainBatchHandler(context);
        var command = new SplitGrainBatchCommand(
            batch.Id,
            new List<SplitTarget> { new(Guid.NewGuid(), 50m) },
            null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── TransferGrain ─────────────────────────────────────────────────────

    private static async Task<(GrainBatch source, GrainBatch target)> CreateTwoBatches(IAppDbContext context)
    {
        var storageId1 = Guid.NewGuid();
        var storageId2 = Guid.NewGuid();

        // Add storages so the target storage lookup succeeds
        context.GrainStorages.Add(new Domain.GrainStorage.GrainStorage
        {
            Id = storageId1,
            Name = "Storage A",
            IsActive = true,
        });
        context.GrainStorages.Add(new Domain.GrainStorage.GrainStorage
        {
            Id = storageId2,
            Name = "Storage B",
            IsActive = true,
        });

        var source = new GrainBatch
        {
            GrainStorageId = storageId1,
            GrainType = "Wheat",
            QuantityTons = 200m,
            InitialQuantityTons = 200m,
            ReceivedDate = DateTime.Today,
        };
        var target = new GrainBatch
        {
            GrainStorageId = storageId2,
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

        var command = new TransferGrainCommand(source.Id, target.Id, null, 80m, DateTime.Today, "Test transfer");
        await handler.Handle(command, CancellationToken.None);

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(source.Id);
        var updatedTarget = await ((TestDbContext)context).GrainBatches.FindAsync(target.Id);

        updatedSource!.QuantityTons.Should().Be(120m); // 200 - 80
        updatedTarget!.QuantityTons.Should().Be(130m); // 50 + 80
    }

    [Fact]
    public async Task TransferGrain_ValidTransfer_CreatesTransferRecord()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, null, 30m, DateTime.Today, "Notes");
        var transferId = await handler.Handle(command, CancellationToken.None);

        var transfer = await ((TestDbContext)context).GrainTransfers.FindAsync(transferId);
        transfer.Should().NotBeNull();
        transfer!.SourceBatchId.Should().Be(source.Id);
        transfer.TargetBatchId.Should().Be(target.Id);
        transfer.QuantityTons.Should().Be(30m);
        transfer.Notes.Should().Be("Notes");
    }

    [Fact]
    public async Task TransferGrain_ValidTransfer_CreatesPairedMovementsLinkedToTransfer()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, null, 40m, DateTime.Today, null);
        var transferId = await handler.Handle(command, CancellationToken.None);

        var movements = await ((TestDbContext)context).GrainMovements
            .Where(m => m.GrainTransferId == transferId)
            .ToListAsync();

        movements.Should().HaveCount(2);
        movements.Should().ContainSingle(m => m.MovementType == "Out" && m.GrainBatchId == source.Id);
        movements.Should().ContainSingle(m => m.MovementType == "In" && m.GrainBatchId == target.Id);
    }

    [Fact]
    public async Task TransferGrain_InsufficientQuantity_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, null, 999m, DateTime.Today, null);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*Insufficient*");
    }

    [Fact]
    public async Task TransferGrain_SameBatch_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var (source, _) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, source.Id, null, 10m, DateTime.Today, null);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task TransferGrain_NonExistentSource_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(Guid.NewGuid(), Guid.NewGuid(), null, 10m, DateTime.Today, null);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task TransferGrain_ToNewBatchInStorage_CreatesNewBatch()
    {
        var context = CreateDbContext();
        var storageId = Guid.NewGuid();
        var targetStorageId = Guid.NewGuid();

        context.GrainStorages.Add(new Domain.GrainStorage.GrainStorage { Id = storageId, Name = "Source Storage", IsActive = true });
        context.GrainStorages.Add(new Domain.GrainStorage.GrainStorage { Id = targetStorageId, Name = "Target Storage", IsActive = true });
        var source = new GrainBatch
        {
            GrainStorageId = storageId,
            GrainType = "Corn",
            QuantityTons = 100m,
            InitialQuantityTons = 100m,
            ReceivedDate = DateTime.Today,
        };
        context.GrainBatches.Add(source);
        await context.SaveChangesAsync();

        var handler = new TransferGrainHandler(context);
        var command = new TransferGrainCommand(source.Id, null, targetStorageId, 60m, DateTime.Today, "Auto-create target");
        await handler.Handle(command, CancellationToken.None);

        var updatedSource = await ((TestDbContext)context).GrainBatches.FindAsync(source.Id);
        updatedSource!.QuantityTons.Should().Be(40m); // 100 - 60

        var newBatch = await ((TestDbContext)context).GrainBatches
            .FirstOrDefaultAsync(b => b.GrainStorageId == targetStorageId);
        newBatch.Should().NotBeNull();
        newBatch!.GrainType.Should().Be("Corn");
        newBatch.QuantityTons.Should().Be(60m);
    }

    [Fact]
    public async Task TransferGrain_ZeroQuantity_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var (source, target) = await CreateTwoBatches(context);
        var handler = new TransferGrainHandler(context);

        var command = new TransferGrainCommand(source.Id, target.Id, null, 0m, DateTime.Today, null);
        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }
}