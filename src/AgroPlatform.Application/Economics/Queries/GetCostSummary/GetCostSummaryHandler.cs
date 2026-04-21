using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetCostSummary;

public class GetCostSummaryHandler : IRequestHandler<GetCostSummaryQuery, CostSummaryDto>
{
    private readonly IAppDbContext _context;

    public GetCostSummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<CostSummaryDto> Handle(GetCostSummaryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CostRecords.AsQueryable();

        if (request.Category.HasValue)
            query = query.Where(c => c.Category == request.Category.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(c => c.Date >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(c => c.Date <= request.DateTo.Value);

        var raw = await query
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, Amount = g.Sum(c => c.Amount), Count = g.Count() })
            .ToListAsync(cancellationToken);

        var byCategory = raw
            .Select(g => new EconomicsByCategoryDto(g.Category.ToString(), g.Amount, g.Count))
            .ToList();

        var totalAmount = byCategory.Sum(c => c.Amount);

        return new CostSummaryDto(totalAmount, byCategory);
    }
}
