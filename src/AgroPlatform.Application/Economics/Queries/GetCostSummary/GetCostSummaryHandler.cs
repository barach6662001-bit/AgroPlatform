using AgroPlatform.Application.Common.Interfaces;
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

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(c => c.Category == request.Category);

        if (request.DateFrom.HasValue)
            query = query.Where(c => c.Date >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(c => c.Date <= request.DateTo.Value);

        var byCategory = await query
            .GroupBy(c => c.Category)
            .Select(g => new CategorySummaryDto(g.Key, g.Sum(c => c.Amount), g.Count()))
            .ToListAsync(cancellationToken);

        var totalAmount = byCategory.Sum(c => c.Amount);

        return new CostSummaryDto(totalAmount, byCategory);
    }
}
