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

        // Revenue from sales (grouped by product)
        var salesByProduct = await _context.Sales
            .Where(s => s.Date >= yearStart && s.Date <= yearEnd)
            .GroupBy(s => s.Product)
            .Select(g => new { Product = g.Key, Revenue = g.Sum(s => s.TotalAmount) })
            .ToListAsync(cancellationToken);

        // Revenue from sales (grouped by field)
        var salesByField = await _context.Sales
            .Where(s => s.Date >= yearStart && s.Date <= yearEnd && s.FieldId.HasValue)
            .GroupBy(s => new { s.FieldId, s.Field!.Name })
            .Select(g => new { g.Key.FieldId, FieldName = g.Key.Name, Revenue = g.Sum(s => s.TotalAmount) })
            .ToListAsync(cancellationToken);

        // Costs from CostRecords (positive amounts = expenses)
        var costsByCategory = await _context.CostRecords
            .Where(c => c.Date >= yearStart && c.Date <= yearEnd && c.Amount > 0)
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, Costs = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        // Costs per field
        var costsByField = await _context.CostRecords
            .Where(c => c.Date >= yearStart && c.Date <= yearEnd && c.Amount > 0 && c.FieldId.HasValue)
            .GroupBy(c => new { c.FieldId, c.Field!.Name })
            .Select(g => new { g.Key.FieldId, FieldName = g.Key.Name, Costs = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var totalRevenue = salesByProduct.Sum(s => s.Revenue);
        var totalCosts   = costsByCategory.Sum(c => c.Costs);
        var margin       = totalRevenue - totalCosts;
        var marginPct    = totalRevenue > 0 ? Math.Round(margin / totalRevenue * 100, 2) : (decimal?)null;

        // Build ByProduct rows: merge sales revenue with cost categories on product name (best effort)
        var byProduct = salesByProduct
            .Select(s =>
            {
                var row = new MarginalityRowDto
                {
                    Label   = s.Product,
                    Revenue = s.Revenue,
                    // CostRecords are not tagged by product, so costs are distributed across products
                    // using revenue-weighted allocation: each product bears a share of total costs
                    // proportional to its revenue share (product_revenue / total_revenue).
                    Costs   = totalRevenue > 0
                        ? Math.Round(totalCosts * (s.Revenue / totalRevenue), 2)
                        : 0,
                };
                row.Margin        = row.Revenue - row.Costs;
                row.MarginPercent = row.Revenue > 0
                    ? Math.Round(row.Margin / row.Revenue * 100, 2)
                    : null;
                return row;
            })
            .OrderByDescending(r => r.Revenue)
            .ToList();

        // Build ByField rows: union of fields that have sales or costs
        var fieldIds = salesByField.Select(s => s.FieldId).Union(costsByField.Select(c => c.FieldId)).Distinct().ToList();

        var byField = fieldIds
            .Select(id =>
            {
                var sale = salesByField.FirstOrDefault(s => s.FieldId == id);
                var cost = costsByField.FirstOrDefault(c => c.FieldId == id);
                var label = sale?.FieldName ?? cost?.FieldName ?? id?.ToString() ?? "-";
                var rev  = sale?.Revenue ?? 0;
                var cst  = cost?.Costs   ?? 0;
                var mgn  = rev - cst;
                return new MarginalityRowDto
                {
                    Label         = label,
                    Revenue       = rev,
                    Costs         = cst,
                    Margin        = mgn,
                    MarginPercent = rev > 0 ? Math.Round(mgn / rev * 100, 2) : null,
                };
            })
            .OrderByDescending(r => r.Revenue)
            .ToList();

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
