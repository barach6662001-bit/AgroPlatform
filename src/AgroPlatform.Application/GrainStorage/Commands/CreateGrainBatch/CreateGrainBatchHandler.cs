using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;

public class CreateGrainBatchHandler : IRequestHandler<CreateGrainBatchCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrainBatchCommand request, CancellationToken cancellationToken)
    {
        IDbContextTransaction? tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync(cancellationToken)
            : null;
        await using var _ = tx;

        var batch = new GrainBatch
        {
            GrainType = request.GrainType,
            QuantityTons = request.InitialQuantityTons,
            InitialQuantityTons = request.InitialQuantityTons,
            OwnershipType = request.OwnershipType,
            OwnerName = request.OwnerName,
            ContractNumber = request.ContractNumber,
            PricePerTon = request.PricePerTon,
            ReceivedDate = request.ReceivedDate,
            SourceFieldId = request.SourceFieldId,
            MoisturePercent = request.MoisturePercent,
            Notes = request.Notes,
        };

        _context.GrainBatches.Add(batch);

        // Create the initial placement representing where the grain is stored on receipt.
        _context.GrainBatchPlacements.Add(new GrainBatchPlacement
        {
            GrainBatchId = batch.Id,
            GrainStorageId = request.GrainStorageId,
            QuantityTons = request.InitialQuantityTons,
        });

        await _context.SaveChangesAsync(cancellationToken);

        // Record the initial receipt as a ledger entry
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = batch.Id,
            MovementType = GrainMovementType.Receipt,
            QuantityTons = request.InitialQuantityTons,
            MovementDate = request.ReceivedDate,
            Notes = request.Notes,
        });
        await _context.SaveChangesAsync(cancellationToken);

        if (request.SourceFieldId.HasValue)
        {
            await SyncFieldHarvest(request.SourceFieldId.Value, batch, cancellationToken);
        }

        if (tx != null)
            await tx.CommitAsync(cancellationToken);

        return batch.Id;
    }

    private async Task SyncFieldHarvest(Guid fieldId, GrainBatch batch, CancellationToken ct)
    {
        var field = await _context.Fields.FindAsync(new object[] { fieldId }, ct);
        if (field == null) return;

        var year = batch.ReceivedDate.Year;

        var existing = await _context.FieldHarvests
            .FirstOrDefaultAsync(h =>
                h.FieldId == fieldId &&
                h.Year == year &&
                h.CropName == batch.GrainType &&
                !h.IsDeleted, ct);

        if (existing != null)
        {
            existing.TotalTons += batch.InitialQuantityTons;
            existing.YieldTonsPerHa = field.AreaHectares > 0
                ? Math.Round(existing.TotalTons / field.AreaHectares, 2)
                : null;
            existing.UpdatedAtUtc = DateTime.UtcNow;
            existing.SyncedFromGrainStorage = true;
        }
        else
        {
            var harvest = new FieldHarvest
            {
                FieldId = fieldId,
                Year = year,
                CropName = batch.GrainType,
                TotalTons = batch.InitialQuantityTons,
                YieldTonsPerHa = field.AreaHectares > 0
                    ? Math.Round(batch.InitialQuantityTons / field.AreaHectares, 2)
                    : null,
                MoisturePercent = batch.MoisturePercent,
                HarvestDate = batch.ReceivedDate,
                SyncedFromGrainStorage = true,
                GrainBatchId = batch.Id,
            };
            _context.FieldHarvests.Add(harvest);
        }

        await _context.SaveChangesAsync(ct);
    }
}
