using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public class GetGrainMovementsHandler : IRequestHandler<GetGrainMovementsQuery, List<GrainMovementDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainMovementsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GrainMovementDto>> Handle(GetGrainMovementsQuery request, CancellationToken cancellationToken)
    {
        return await _context.GrainMovements
            .Where(m => m.GrainBatchId == request.BatchId)
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new GrainMovementDto
            {
                Id = m.Id,
                GrainBatchId = m.GrainBatchId,
                MovementType = m.MovementType,
                QuantityTons = m.QuantityTons,
                MovementDate = m.MovementDate,
                Reason = m.Reason,
                Notes = m.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
