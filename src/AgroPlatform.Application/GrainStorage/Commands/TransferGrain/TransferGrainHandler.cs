using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using FluentValidation.Results;
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
        await using var tx = await _context.Database
            .BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.GrainMovements
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx is not null) await tx.CommitAsync(cancellationToken);
                return existing.OperationId ?? existing.Id;
            }
        }

        var source = await _context.GrainBatches
            .Include(b => b.Placements)
            .FirstOrDefaultAsync(b => b.Id == request.SourceBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.SourceBatchId);

        var target = await _context.GrainBatches
            .Include(b => b.Placements)
            .FirstOrDefaultAsync(b => b.Id == request.TargetBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.TargetBatchId);

        // Validate source placement exists and has sufficient quantity
        var sourcePlacement = source.Placements.FirstOrDefault();
        if (sourcePlacement == null)
            throw new ValidationException(new[] { new ValidationFailure("SourceBatchId", "Source batch has no placement in any storage.") });
        if (sourcePlacement.QuantityTons < request.QuantityTons)
            throw new ValidationException(new[] { new ValidationFailure("QuantityTons",
                $"Insufficient quantity in storage placement. Available: {sourcePlacement.QuantityTons:F4} t, Requested: {request.QuantityTons:F4} t") });

        source.ReduceQuantity(request.QuantityTons);

        var sourceStorageId = sourcePlacement.GrainStorageId;
        var targetPlacement = target.Placements.FirstOrDefault();
        var targetStorageId = targetPlacement?.GrainStorageId;
        var operationId = Guid.NewGuid();
        var movementDate = request.MovementDate ?? DateTime.UtcNow;

        // Outgoing leg on source
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = source.Id,
            MovementType = GrainMovementType.Transfer,
            QuantityTons = request.QuantityTons,
            MovementDate = movementDate,
            OperationId = operationId,
            SourceStorageId = sourceStorageId,
            TargetStorageId = targetStorageId,
            TargetBatchId = target.Id,
            Notes = request.Notes,
            ClientOperationId = request.ClientOperationId,
        });

        // Incoming leg on target
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = target.Id,
            MovementType = GrainMovementType.Transfer,
            QuantityTons = request.QuantityTons,
            MovementDate = movementDate,
            OperationId = operationId,
            SourceStorageId = sourceStorageId,
            TargetStorageId = targetStorageId,
            SourceBatchId = source.Id,
            Notes = request.Notes,
            ClientOperationId = request.ClientOperationId,
        });

        // quantity already reduced on source above; increase target
        target.IncreaseQuantity(request.QuantityTons);

        // Update source placement quantity
        sourcePlacement.QuantityTons -= request.QuantityTons;

        // Update or create target placement
        if (targetPlacement != null)
        {
            targetPlacement.QuantityTons += request.QuantityTons;
        }
        else
        {
            // Target has no placement — create one in the source storage
            _context.GrainBatchPlacements.Add(new GrainBatchPlacement
            {
                GrainBatchId = target.Id,
                GrainStorageId = sourceStorageId,
                QuantityTons = request.QuantityTons,
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (tx is not null)
            await tx.CommitAsync(cancellationToken);

        return operationId;
    }
}
