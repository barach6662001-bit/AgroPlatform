using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainReceipt;

public class AddGrainReceiptHandler : IRequestHandler<AddGrainReceiptCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddGrainReceiptHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddGrainReceiptCommand request, CancellationToken cancellationToken)
    {
        var tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync(cancellationToken)
            : null;
        await using var _ = tx;

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.GrainMovements
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx != null) await tx.CommitAsync(cancellationToken);
                return existing.Id;
            }
        }

        var batch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.GrainBatchId && !b.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId);

        // Increase batch quantity
        batch.IncreaseQuantity(request.QuantityTons);

        // Update or create placement for the target storage
        var placement = await _context.GrainBatchPlacements
            .FirstOrDefaultAsync(p =>
                p.GrainBatchId == request.GrainBatchId &&
                p.GrainStorageId == request.GrainStorageId &&
                !p.IsDeleted, cancellationToken);

        if (placement != null)
        {
            placement.QuantityTons += request.QuantityTons;
        }
        else
        {
            _context.GrainBatchPlacements.Add(new GrainBatchPlacement
            {
                GrainBatchId = request.GrainBatchId,
                GrainStorageId = request.GrainStorageId,
                QuantityTons = request.QuantityTons,
            });
        }

        // Record receipt movement
        var movement = new GrainMovement
        {
            GrainBatchId = request.GrainBatchId,
            MovementType = GrainMovementType.Receipt,
            QuantityTons = request.QuantityTons,
            MovementDate = request.ReceivedDate,
            TargetStorageId = request.GrainStorageId,
            Notes = request.Notes,
            ClientOperationId = request.ClientOperationId,
        };
        _context.GrainMovements.Add(movement);

        await _context.SaveChangesAsync(cancellationToken);

        if (tx != null) await tx.CommitAsync(cancellationToken);

        return movement.Id;
    }
}
