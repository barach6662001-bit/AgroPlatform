using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainBatchPlacement;

public class AddGrainBatchPlacementHandler : IRequestHandler<AddGrainBatchPlacementCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddGrainBatchPlacementHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddGrainBatchPlacementCommand request, CancellationToken cancellationToken)
    {
        var batchExists = await _context.GrainBatches
            .AnyAsync(b => b.Id == request.GrainBatchId, cancellationToken);

        if (!batchExists)
            throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId);

        var storageExists = await _context.GrainStorages
            .AnyAsync(s => s.Id == request.GrainStorageId, cancellationToken);

        if (!storageExists)
            throw new NotFoundException(nameof(GrainStorage), request.GrainStorageId);

        var placement = new GrainBatchPlacement
        {
            GrainBatchId = request.GrainBatchId,
            GrainStorageId = request.GrainStorageId,
            GrainStorageUnitId = request.GrainStorageUnitId,
            QuantityTons = request.QuantityTons,
        };

        _context.GrainBatchPlacements.Add(placement);
        await _context.SaveChangesAsync(cancellationToken);

        return placement.Id;
    }
}
