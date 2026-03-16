using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public class GetGrainMovementsHandler : IRequestHandler<GetGrainMovementsQuery, IReadOnlyList<GrainMovementDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainMovementsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<GrainMovementDto>> Handle(GetGrainMovementsQuery request, CancellationToken cancellationToken)
    {
        return await _context.GrainMovements
            .Where(m => m.GrainBatchId == request.GrainBatchId)
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new GrainMovementDto
            {
                Id = m.Id,
                GrainBatchId = m.GrainBatchId,
                MovementType = m.MovementType,
                QuantityTons = m.QuantityTons,
                MovementDate = m.MovementDate,
                Reason = m.Reason,
                Notes = m.Notes
            })
            .ToListAsync(cancellationToken);
    }
}
