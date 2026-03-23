using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
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
        var years = request.Years.Count > 0
            ? request.Years.Distinct().OrderBy(y => y).ToList()
            : Enumerable.Range(DateTime.UtcNow.Year - 2, 3).ToList();

        // Total field area (used for per-hectare metrics)
        var totalArea = await _context.Fields
            .SumAsync(f => f.AreaHectares, cancellationToken);

        // Revenue from sales, grouped by year
        var salesByYear = await _context.Sales
            .Where(s => years.Contains(s.Date.Year))
            .GroupBy(s => s.Date.Year)
            .Select(g => new { Year = g.Key, Revenue = g.Sum(s => s.TotalAmount) })
            .ToListAsync(cancellationToken);

        // Costs from CostRecords (positive amounts = expenses), grouped by year
        var costsByYear = await _context.CostRecords
            .Where(c => years.Contains(c.Date.Year) && c.Amount > 0)
            .GroupBy(c => c.Date.Year)
            .Select(g => new { Year = g.Key, Costs = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var result = years.Select(year =>
        {
            var revenue = salesByYear.FirstOrDefault(s => s.Year == year)?.Revenue ?? 0m;
            var costs   = costsByYear.FirstOrDefault(c => c.Year == year)?.Costs   ?? 0m;
            var margin  = revenue - costs;

            return new SeasonComparisonDto
            {
                Year              = year,
                TotalRevenue      = revenue,
                TotalCosts        = costs,
                Margin            = margin,
                MarginPercent     = revenue > 0 ? Math.Round(margin / revenue * 100, 2) : null,
                TotalAreaHectares = totalArea > 0 ? totalArea : null,
                CostsPerHectare   = totalArea > 0 ? Math.Round(costs   / totalArea, 2) : null,
                RevenuePerHectare = totalArea > 0 ? Math.Round(revenue / totalArea, 2) : null,
            };
        }).ToList();

        return result;
    }
}
