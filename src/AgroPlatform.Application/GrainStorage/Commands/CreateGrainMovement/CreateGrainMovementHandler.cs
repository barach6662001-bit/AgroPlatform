using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;

public class CreateGrainMovementHandler : IRequestHandler<CreateGrainMovementCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateGrainMovementHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrainMovementCommand request, CancellationToken cancellationToken)
    {
        var batch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.GrainBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId);

        var movement = new GrainMovement
        {
            GrainBatchId = request.GrainBatchId,
            MovementType = request.MovementType,
            QuantityTons = request.QuantityTons,
            MovementDate = request.MovementDate,
            Reason = request.Reason,
            Notes = request.Notes
        };

        if (request.MovementType == "In")
            batch.QuantityTons += request.QuantityTons;
        else if (request.MovementType == "Out")
            batch.QuantityTons -= request.QuantityTons;

        _context.GrainMovements.Add(movement);
        await _context.SaveChangesAsync(cancellationToken);
        return movement.Id;
    }
}
