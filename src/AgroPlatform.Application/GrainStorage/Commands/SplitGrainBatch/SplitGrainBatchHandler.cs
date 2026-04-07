using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public class SplitGrainBatchHandler : IRequestHandler<SplitGrainBatchCommand, Guid>
{
    private readonly IAppDbContext _context;

    public SplitGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(SplitGrainBatchCommand request, CancellationToken cancellationToken)
    {
        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.GrainMovements
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
                return existing.TargetBatchId ?? existing.Id;
        }

        var source = await _context.GrainBatches
            .Include(b => b.Placements)
            .FirstOrDefaultAsync(b => b.Id == request.SourceBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.SourceBatchId);

        source.ReduceQuantity(request.SplitQuantityTons); // guard: throws if insufficient quantity

        var sourceStorageId = source.Placements.FirstOrDefault()?.GrainStorageId;
        var targetStorageId = request.TargetStorageId ?? sourceStorageId;
        var movementDate = request.MovementDate ?? DateTime.UtcNow;
        var operationId = Guid.NewGuid();

        // Begin a real DB transaction only when supported (relational providers).
        // In-memory provider used in unit tests does not support transactions.
        IDbContextTransaction? tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync(cancellationToken)
            : null;
        await using var _ = tx;

        // Create the new (split-off) batch
        var newBatch = new GrainBatch
        {
            GrainType = source.GrainType,
            QuantityTons = request.SplitQuantityTons,
            InitialQuantityTons = request.SplitQuantityTons,
            OwnershipType = source.OwnershipType,
            OwnerName = source.OwnerName,
            ContractNumber = source.ContractNumber,
            PricePerTon = source.PricePerTon,
            ReceivedDate = movementDate,
            SourceFieldId = source.SourceFieldId,
            MoisturePercent = source.MoisturePercent,
            Notes = request.Notes,
        };
        _context.GrainBatches.Add(newBatch);

        // Place split batch in target storage if known
        if (targetStorageId.HasValue)
        {
            _context.GrainBatchPlacements.Add(new GrainBatchPlacement
            {
                GrainBatchId = newBatch.Id,
                GrainStorageId = targetStorageId.Value,
                QuantityTons = request.SplitQuantityTons,
            });

            // Reduce source batch placement quantity too
            var sourcePlacement = source.Placements.FirstOrDefault(p => p.GrainStorageId == sourceStorageId);
            if (sourcePlacement != null)
                sourcePlacement.QuantityTons -= request.SplitQuantityTons;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Outgoing leg on source batch
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = source.Id,
            MovementType = GrainMovementType.Split,
            QuantityTons = request.SplitQuantityTons,
            MovementDate = movementDate,
            OperationId = operationId,
            SourceStorageId = sourceStorageId,
            TargetStorageId = targetStorageId,
            TargetBatchId = newBatch.Id,
            Notes = request.Notes,
            ClientOperationId = request.ClientOperationId,
        });

        // Incoming leg on new batch (Receipt via split)
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = newBatch.Id,
            MovementType = GrainMovementType.Split,
            QuantityTons = request.SplitQuantityTons,
            MovementDate = movementDate,
            OperationId = operationId,
            SourceStorageId = sourceStorageId,
            TargetStorageId = targetStorageId,
            SourceBatchId = source.Id,
            Notes = request.Notes,
        });

        // source quantity already reduced above via ReduceQuantity

        await _context.SaveChangesAsync(cancellationToken);

        if (tx != null)
            await tx.CommitAsync(cancellationToken);

        return newBatch.Id;
    }
}
