using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.TransferGrain;

public class TransferGrainHandler : IRequestHandler<TransferGrainCommand, Guid>
{
    private readonly IAppDbContext _context;

    public TransferGrainHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(TransferGrainCommand request, CancellationToken cancellationToken)
    {
        // ── Validate source batch ──────────────────────────────────────────
        var sourceBatch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.SourceBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.SourceBatchId);

        if (request.QuantityTons <= 0)
            throw new ConflictException("Transfer quantity must be greater than zero.");

        if (sourceBatch.QuantityTons < request.QuantityTons)
            throw new ConflictException(
                $"Insufficient grain in source batch. Available: {sourceBatch.QuantityTons:F4} t, Requested: {request.QuantityTons:F4} t.");

        // ── Resolve target batch ───────────────────────────────────────────
        GrainBatch targetBatch;
        bool newBatchCreated = false;

        if (request.TargetBatchId.HasValue)
        {
            targetBatch = await _context.GrainBatches
                .FirstOrDefaultAsync(b => b.Id == request.TargetBatchId.Value, cancellationToken)
                ?? throw new NotFoundException(nameof(GrainBatch), request.TargetBatchId.Value);

            if (targetBatch.Id == sourceBatch.Id)
                throw new ConflictException("Source and target batch must be different.");
        }
        else
        {
            // TargetStorageId must be provided when no target batch is given
            if (!request.TargetStorageId.HasValue)
                throw new ConflictException("Either TargetBatchId or TargetStorageId must be specified.");

            var targetStorage = await _context.GrainStorages
                .FirstOrDefaultAsync(s => s.Id == request.TargetStorageId.Value, cancellationToken)
                ?? throw new NotFoundException("GrainStorage", request.TargetStorageId.Value);

            if (!targetStorage.IsActive)
                throw new ConflictException($"Target storage '{targetStorage.Name}' is not active.");

            // Create a new batch in the target storage with the same grain type
            targetBatch = new GrainBatch
            {
                GrainType = sourceBatch.GrainType,
                QuantityTons = 0m,
                InitialQuantityTons = 0m,
                OwnershipType = sourceBatch.OwnershipType,
                OwnerName = sourceBatch.OwnerName,
                ReceivedDate = request.TransferDate,
                MoisturePercent = sourceBatch.MoisturePercent,
                Notes = $"Створено автоматично при переміщенні з партії {sourceBatch.Id}",
            };
            _context.GrainBatches.Add(targetBatch);
            _context.GrainBatchPlacements.Add(new GrainBatchPlacement
            {
                GrainBatchId = targetBatch.Id,
                GrainStorageId = targetStorage.Id,
                QuantityTons = request.QuantityTons,
            });
            newBatchCreated = true;
        }

        // ── Create the transfer record ─────────────────────────────────────
        var transfer = new GrainTransfer
        {
            SourceBatchId = sourceBatch.Id,
            TargetBatchId = targetBatch.Id,
            QuantityTons = request.QuantityTons,
            TransferDate = request.TransferDate,
            Notes = request.Notes,
        };
        _context.GrainTransfers.Add(transfer);

        // Save first so we have IDs available for the movement links
        if (newBatchCreated)
            await _context.SaveChangesAsync(cancellationToken);

        // ── Create paired movements ────────────────────────────────────────
        var outMovement = new GrainMovement
        {
            GrainBatchId = sourceBatch.Id,
            MovementType = "Out",
            QuantityTons = request.QuantityTons,
            MovementDate = request.TransferDate,
            Reason = "transfer",
            Notes = request.Notes,
            GrainTransferId = transfer.Id,
        };

        var inMovement = new GrainMovement
        {
            GrainBatchId = targetBatch.Id,
            MovementType = "In",
            QuantityTons = request.QuantityTons,
            MovementDate = request.TransferDate,
            Reason = "transfer",
            Notes = request.Notes,
            GrainTransferId = transfer.Id,
        };

        _context.GrainMovements.Add(outMovement);
        _context.GrainMovements.Add(inMovement);

        // ── Update batch quantities ────────────────────────────────────────
        sourceBatch.QuantityTons -= request.QuantityTons;
        targetBatch.QuantityTons += request.QuantityTons;

        // Also keep InitialQuantityTons in sync for new batch
        if (newBatchCreated)
            targetBatch.InitialQuantityTons = request.QuantityTons;

        await _context.SaveChangesAsync(cancellationToken);

        return transfer.Id;
    }
}
