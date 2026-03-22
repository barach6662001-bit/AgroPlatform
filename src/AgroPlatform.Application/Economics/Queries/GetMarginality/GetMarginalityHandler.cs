using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

public class GetMarginalityHandler : IRequestHandler<GetMarginalityQuery, MarginalitySummaryDto>
{
    private readonly IAppDbContext _context;

    public GetMarginalityHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<MarginalitySummaryDto> Handle(GetMarginalityQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        // Load sales for the year
        var sales = await _context.Sales
            .Where(s => !s.IsDeleted && s.Date >= yearStart && s.Date <= yearEnd)
            .Select(s => new { s.Product, s.TotalAmount, s.FieldId, s.Currency })
            .ToListAsync(cancellationToken);

        // Load cost records for the year (positive amounts = expenses)
        var costRecords = await _context.CostRecords
            .Where(c => !c.IsDeleted && c.Date >= yearStart && c.Date <= yearEnd && c.Amount > 0)
            .Select(c => new { c.FieldId, c.Amount })
            .ToListAsync(cancellationToken);

        // Load field names for display
        var fieldIds = sales
            .Where(s => s.FieldId.HasValue)
            .Select(s => s.FieldId!.Value)
            .Union(costRecords.Where(c => c.FieldId.HasValue).Select(c => c.FieldId!.Value))
            .ToList();

        var fieldNames = await _context.Fields
            .Where(f => !f.IsDeleted && fieldIds.Contains(f.Id))
            .Select(f => new { f.Id, f.Name })
            .ToDictionaryAsync(f => f.Id, f => f.Name, cancellationToken);

        // Totals
        var totalRevenue = sales.Sum(s => s.TotalAmount);
        var totalCosts   = costRecords.Sum(c => c.Amount);
        var margin       = totalRevenue - totalCosts;
        var marginPct    = totalRevenue > 0 ? Math.Round(margin / totalRevenue * 100, 2) : (decimal?)null;

        // By product (revenue only — cost attribution to products is not modelled)
        var byProduct = sales
            .GroupBy(s => s.Product)
            .Select(g =>
            {
                var rev = g.Sum(s => s.TotalAmount);
                return new MarginalityRowDto
                {
                    Label    = g.Key,
                    Revenue  = rev,
                    Costs    = 0,
                    Margin   = rev,
                    MarginPercent = null,
                };
            })
            .OrderByDescending(r => r.Revenue)
            .ToList();

        // By field (revenue from sales + costs from cost-records linked to the same field)
        var byField = new List<MarginalityRowDto>();

        var revenueByField = sales
            .Where(s => s.FieldId.HasValue)
            .GroupBy(s => s.FieldId!.Value)
            .ToDictionary(g => g.Key, g => g.Sum(s => s.TotalAmount));

        var costsByField = costRecords
            .Where(c => c.FieldId.HasValue)
            .GroupBy(c => c.FieldId!.Value)
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        foreach (var fid in fieldIds)
        {
            var rev  = revenueByField.TryGetValue(fid, out var r) ? r : 0m;
            var cost = costsByField.TryGetValue(fid, out var c) ? c : 0m;
            var fieldMargin = rev - cost;
            var fieldMarginPct = rev > 0 ? Math.Round(fieldMargin / rev * 100, 2) : (decimal?)null;

            byField.Add(new MarginalityRowDto
            {
                Label         = fieldNames.TryGetValue(fid, out var name) ? name : fid.ToString(),
                Revenue       = rev,
                Costs         = cost,
                Margin        = fieldMargin,
                MarginPercent = fieldMarginPct,
            });
        }

        byField = byField.OrderByDescending(r => r.Revenue).ToList();

        return new MarginalitySummaryDto
        {
            TotalRevenue  = totalRevenue,
            TotalCosts    = totalCosts,
            Margin        = margin,
            MarginPercent = marginPct,
            ByProduct     = byProduct,
            ByField       = byField,
        };
    }
}
