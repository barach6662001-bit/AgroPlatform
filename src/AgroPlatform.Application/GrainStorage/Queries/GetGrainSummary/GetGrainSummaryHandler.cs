using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainSummary;

public class GetGrainSummaryHandler : IRequestHandler<GetGrainSummaryQuery, IReadOnlyList<GrainSummaryDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainSummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<GrainSummaryDto>> Handle(GetGrainSummaryQuery request, CancellationToken cancellationToken)
    {
        var summary = await _context.GrainBatches
            .Where(b => b.QuantityTons > 0)
            .GroupBy(b => b.GrainType)
            .Select(g => new GrainSummaryDto
            {
                GrainType = g.Key,
                TotalTons = g.Sum(b => b.QuantityTons),
                BatchCount = g.Count(),
            })
            .OrderByDescending(x => x.TotalTons)
            .ToListAsync(cancellationToken);

        return summary;
    }
}
