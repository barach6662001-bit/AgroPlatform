using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

public class GetMarginalityHandler : IRequestHandler<GetMarginalityQuery, IReadOnlyList<MarginalityRowDto>>
{
    private readonly IAppDbContext _context;

    public GetMarginalityHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<MarginalityRowDto>> Handle(GetMarginalityQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);
        var groupBy   = string.IsNullOrWhiteSpace(request.GroupBy) ? "field" : request.GroupBy.ToLowerInvariant();

        // ── Sales (revenue) ──────────────────────────────────────────────
        var sales = await _context.Sales
            .Where(s => !s.IsDeleted && s.Date >= yearStart && s.Date <= yearEnd)
            .Select(s => new
            {
                s.FieldId,
                s.Product,
                s.TotalAmount
            })
            .ToListAsync(cancellationToken);

        // Load field names for field-based grouping
        Dictionary<Guid, string> fieldNames = new();
        if (groupBy == "field")
        {
            var fields = await _context.Fields
        const string baseCurrency = "UAH";

        // Load sales for the year
        var sales = await _context.Sales
            .Where(s => !s.IsDeleted && s.Date >= yearStart && s.Date <= yearEnd && s.Currency == baseCurrency)
            .Select(s => new { s.Product, s.TotalAmount, s.FieldId, s.Currency })
            .ToListAsync(cancellationToken);

        // Load cost records for the year (positive amounts = expenses)
        var costRecords = await _context.CostRecords
            .Where(c => !c.IsDeleted && c.Date >= yearStart && c.Date <= yearEnd && c.Amount > 0 && c.Currency == baseCurrency)
            .Select(c => new { c.FieldId, c.Amount })
            .ToListAsync(cancellationToken);

        // ── Build rows ────────────────────────────────────────────────────
        var result = new List<MarginalityRowDto>();

        if (groupBy == "product")
        {
            // Group revenue by product name
            var revenueByProduct = sales
                .GroupBy(s => string.IsNullOrWhiteSpace(s.Product) ? "—" : s.Product)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.TotalAmount));

            // Distribute costs proportionally to each product's revenue share
            var totalCosts = costRecords.Sum(c => c.Amount);
            var totalRevenue = revenueByProduct.Values.Sum();

            foreach (var kvp in revenueByProduct.OrderByDescending(kv => kv.Value))
            {
                var rev = kvp.Value;
                var share = totalRevenue > 0 ? rev / totalRevenue : 0m;
                var cost = Math.Round(totalCosts * share, 2);
                var margin = Math.Round(rev - cost, 2);
                var marginPct = rev > 0 ? Math.Round(margin / rev * 100, 2) : (decimal?)null;

                result.Add(new MarginalityRowDto
                {
                    Label = kvp.Key,
                    Revenue = rev,
                    Costs = cost,
                    Margin = margin,
                    MarginPercent = marginPct,
                });
            }
        }
        else
        {
            // Default: group by field
            var allFieldIds = sales.Where(s => s.FieldId.HasValue).Select(s => s.FieldId!.Value)
                .Union(costRecords.Where(c => c.FieldId.HasValue).Select(c => c.FieldId!.Value))
                .Distinct()
                .ToList();

            // Handle records without a field association as a separate row
            var salesWithoutField = sales.Where(s => !s.FieldId.HasValue).Sum(s => s.TotalAmount);
            var costsWithoutField = costRecords.Where(c => !c.FieldId.HasValue).Sum(c => c.Amount);

            foreach (var fieldId in allFieldIds)
            {
                var rev  = sales.Where(s => s.FieldId == fieldId).Sum(s => s.TotalAmount);
                var cost = costRecords.Where(c => c.FieldId == fieldId).Sum(c => c.Amount);
                var margin = Math.Round(rev - cost, 2);
                var marginPct = rev > 0 ? Math.Round(margin / rev * 100, 2) : (decimal?)null;

                var label = fieldNames.TryGetValue(fieldId, out var name) ? name : fieldId.ToString();

                result.Add(new MarginalityRowDto
                {
                    Label = label,
                    Revenue = rev,
                    Costs = cost,
                    Margin = margin,
                    MarginPercent = marginPct,
                });
            }

            if (salesWithoutField > 0 || costsWithoutField > 0)
            {
                var rev    = salesWithoutField;
                var cost   = costsWithoutField;
                var margin = Math.Round(rev - cost, 2);
                var marginPct = rev > 0 ? Math.Round(margin / rev * 100, 2) : (decimal?)null;

                result.Add(new MarginalityRowDto
                {
                    Label = "—",
                    Revenue = rev,
                    Costs = cost,
                    Margin = margin,
                    MarginPercent = marginPct,
                });
            }

            result = result.OrderByDescending(r => r.Revenue).ToList();
        }

        return result;
    }
}
