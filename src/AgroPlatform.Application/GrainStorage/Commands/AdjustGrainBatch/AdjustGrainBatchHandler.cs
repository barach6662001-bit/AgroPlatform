using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;

public class AdjustGrainBatchHandler : IRequestHandler<AdjustGrainBatchCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AdjustGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AdjustGrainBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.BatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.BatchId);

        var movement = new GrainMovement
        {
            GrainBatchId = batch.Id,
            MovementType = GrainMovementType.Adjustment,
            QuantityTons = Math.Abs(request.AdjustmentTons),
            MovementDate = request.MovementDate ?? DateTime.UtcNow,
            Reason = request.Reason,
            Notes = request.Notes,
        };

        _context.GrainMovements.Add(movement);
        batch.QuantityTons += request.AdjustmentTons;

        await _context.SaveChangesAsync(cancellationToken);
        return movement.Id;
    }
}
