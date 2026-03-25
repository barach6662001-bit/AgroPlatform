using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetCostAnalytics;

public class GetCostAnalyticsHandler : IRequestHandler<GetCostAnalyticsQuery, CostAnalyticsDto>
{
    private readonly IAppDbContext _context;

    public GetCostAnalyticsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<CostAnalyticsDto> Handle(GetCostAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;

        var records = await _context.CostRecords
            .Where(c => c.Date.Year == year)
            .Select(c => new { c.Category, c.Amount, c.Date.Month })
            .ToListAsync(cancellationToken);

        var totalCosts = records.Where(r => r.Amount >= 0).Sum(r => r.Amount);
        var totalRevenue = records.Where(r => r.Amount < 0).Sum(r => Math.Abs(r.Amount));

        var byCategory = records
            .GroupBy(r => r.Category)
            .Select(g => new EconomicsByCategoryDto(g.Key.ToString(), g.Sum(r => r.Amount), g.Count()))
            .OrderByDescending(c => Math.Abs(c.Amount))
            .ToList();

        var byMonth = Enumerable.Range(1, 12)
            .Select(m =>
            {
                var monthRecords = records.Where(r => r.Month == m).ToList();
                return new AnalyticsMonthDto(
                    m,
                    monthRecords.Where(r => r.Amount >= 0).Sum(r => r.Amount),
                    monthRecords.Where(r => r.Amount < 0).Sum(r => Math.Abs(r.Amount))
                );
            })
            .ToList();

        return new CostAnalyticsDto(year, totalCosts, totalRevenue, byCategory, byMonth);
    }
}
