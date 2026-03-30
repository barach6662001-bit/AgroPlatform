using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.WriteOffGrainBatch;

public class WriteOffGrainBatchHandler : IRequestHandler<WriteOffGrainBatchCommand, Guid>
{
    private readonly IAppDbContext _context;

    public WriteOffGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(WriteOffGrainBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.BatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.BatchId);

        var movement = new GrainMovement
        {
            GrainBatchId = batch.Id,
            MovementType = GrainMovementType.WriteOff,
            QuantityTons = request.QuantityTons,
            MovementDate = request.MovementDate ?? DateTime.UtcNow,
            Reason = request.Reason,
            Notes = request.Notes,
        };

        _context.GrainMovements.Add(movement);
        batch.ReduceQuantity(request.QuantityTons);

        await _context.SaveChangesAsync(cancellationToken);
        return movement.Id;
    }
}
