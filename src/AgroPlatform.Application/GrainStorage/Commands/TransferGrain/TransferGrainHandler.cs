using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
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
        var source = await _context.GrainBatches
            .Include(b => b.GrainStorage)
            .FirstOrDefaultAsync(b => b.Id == request.SourceBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.SourceBatchId);

        var target = await _context.GrainBatches
            .Include(b => b.GrainStorage)
            .FirstOrDefaultAsync(b => b.Id == request.TargetBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.TargetBatchId);

        if (source.QuantityTons < request.QuantityTons)
            throw new InvalidOperationException(
                $"Insufficient quantity in source batch: available {source.QuantityTons:F4} t, requested {request.QuantityTons:F4} t.");

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
            SourceStorageId = source.GrainStorageId,
            TargetStorageId = target.GrainStorageId,
            TargetBatchId = target.Id,
            Notes = request.Notes,
        });

        // Incoming leg on target
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = target.Id,
            MovementType = GrainMovementType.Transfer,
            QuantityTons = request.QuantityTons,
            MovementDate = movementDate,
            OperationId = operationId,
            SourceStorageId = source.GrainStorageId,
            TargetStorageId = target.GrainStorageId,
            SourceBatchId = source.Id,
            Notes = request.Notes,
        });

        source.QuantityTons -= request.QuantityTons;
        target.QuantityTons += request.QuantityTons;

        await _context.SaveChangesAsync(cancellationToken);

        return operationId;
    }
}
