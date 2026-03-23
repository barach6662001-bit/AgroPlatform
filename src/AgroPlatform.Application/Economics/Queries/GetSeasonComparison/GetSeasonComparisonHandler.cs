using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetSeasonComparison;

public class GetSeasonComparisonHandler : IRequestHandler<GetSeasonComparisonQuery, IReadOnlyList<SeasonComparisonDto>>
{
    private readonly IAppDbContext _context;

    public GetSeasonComparisonHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SeasonComparisonDto>> Handle(GetSeasonComparisonQuery request, CancellationToken cancellationToken)
    {
        var years = request.Years.Length > 0 ? request.Years : new[] { DateTime.UtcNow.Year };

        // Total area across all fields (for per-ha calculations)
        var totalAreaHa = await _context.Fields
            .SumAsync(f => (decimal?)f.AreaHectares, cancellationToken) ?? 0m;

        var result = new List<SeasonComparisonDto>();

        foreach (var year in years.Distinct().OrderBy(y => y))
        {
            var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

            var totalRevenue = await _context.Sales
                .Where(s => s.Date >= yearStart && s.Date <= yearEnd)
                .SumAsync(s => (decimal?)s.TotalAmount, cancellationToken) ?? 0m;

            var totalCosts = await _context.CostRecords
                .Where(c => c.Date >= yearStart && c.Date <= yearEnd && c.Amount > 0)
                .SumAsync(c => (decimal?)c.Amount, cancellationToken) ?? 0m;

            var margin    = totalRevenue - totalCosts;
            var marginPct = totalRevenue > 0
                ? Math.Round(margin / totalRevenue * 100, 2)
                : (decimal?)null;

            var dto = new SeasonComparisonDto
            {
                Year          = year,
                TotalRevenue  = totalRevenue,
                TotalCosts    = totalCosts,
                Margin        = margin,
                MarginPercent = marginPct,
            };

            if (totalAreaHa > 0)
            {
                dto.AreaHa        = Math.Round(totalAreaHa, 2);
                dto.CostPerHa     = Math.Round(totalCosts   / totalAreaHa, 2);
                dto.RevenuePerHa  = Math.Round(totalRevenue / totalAreaHa, 2);
            }

            result.Add(dto);
        }

        return result;
    }
}
