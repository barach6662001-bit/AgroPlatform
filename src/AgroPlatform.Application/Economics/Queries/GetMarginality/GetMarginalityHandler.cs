using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

public class GetMarginalityHandler : IRequestHandler<GetMarginalityQuery, IReadOnlyList<MarginalityItemDto>>
{
    private readonly IAppDbContext _context;

    public GetMarginalityHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<MarginalityItemDto>> Handle(
        GetMarginalityQuery request,
        CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        // ── 1. Identify crops and seeded area from FieldSeedings ──────────────
        var seedings = await _context.FieldSeedings
            .Where(s => !s.IsDeleted && s.Year == year)
            .Select(s => new { s.FieldId, s.CropName })
            .ToListAsync(cancellationToken);

        // Also include crops found only in FieldHarvests for this year
        var harvestCrops = await _context.FieldHarvests
            .Where(h => !h.IsDeleted && h.Year == year)
            .Select(h => new { h.FieldId, h.CropName })
            .ToListAsync(cancellationToken);

        // Union crop names from both sources
        var cropNames = seedings.Select(s => s.CropName)
            .Union(harvestCrops.Select(h => h.CropName))
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        if (cropNames.Count == 0)
            return Array.Empty<MarginalityItemDto>();

        // Map fieldId → cropName (prefer seedings, fallback to harvests)
        var fieldToCrop = new Dictionary<Guid, string>();
        foreach (var h in harvestCrops)
            fieldToCrop[h.FieldId] = h.CropName;
        foreach (var s in seedings)
            fieldToCrop[s.FieldId] = s.CropName; // seedings take priority

        var allFieldIds = fieldToCrop.Keys.ToList();

        // ── 2. Field areas ────────────────────────────────────────────────────
        var fieldAreas = await _context.Fields
            .Where(f => !f.IsDeleted && allFieldIds.Contains(f.Id))
            .Select(f => new { f.Id, f.AreaHectares })
            .ToListAsync(cancellationToken);

        var areaById = fieldAreas.ToDictionary(f => f.Id, f => f.AreaHectares);

        // ── 3. Actual costs (CostRecords for those fields this year) ──────────
        var costRecords = await _context.CostRecords
            .Where(c => !c.IsDeleted
                        && c.FieldId.HasValue
                        && allFieldIds.Contains(c.FieldId!.Value)
                        && c.Date >= yearStart
                        && c.Date <= yearEnd
                        && c.Amount > 0)
            .Select(c => new { c.FieldId, c.Amount })
            .ToListAsync(cancellationToken);

        // ── 4. Actual revenue (FieldHarvests) ─────────────────────────────────
        var harvests = await _context.FieldHarvests
            .Where(h => !h.IsDeleted && h.Year == year && allFieldIds.Contains(h.FieldId))
            .Select(h => new { h.FieldId, h.CropName, h.TotalRevenue, h.TotalTons, h.YieldTonsPerHa })
            .ToListAsync(cancellationToken);

        // ── 5. Planned costs (Budget for the year — totalled across categories) ─
        var totalPlannedCosts = await _context.Budgets
            .Where(b => !b.IsDeleted && b.Year == year)
            .SumAsync(b => b.PlannedAmount, cancellationToken);

        // ── 6. Build result per crop ──────────────────────────────────────────
        var result = new List<MarginalityItemDto>(cropNames.Count);

        foreach (var cropName in cropNames)
        {
            // Fields that have this crop
            var cropFieldIds = fieldToCrop
                .Where(kv => kv.Value == cropName)
                .Select(kv => kv.Key)
                .ToHashSet();

            // Total seeded area
            var areaHa = cropFieldIds
                .Sum(id => areaById.TryGetValue(id, out var a) ? a : 0m);

            // Actual costs
            var actualCosts = costRecords
                .Where(c => c.FieldId.HasValue && cropFieldIds.Contains(c.FieldId!.Value))
                .Sum(c => c.Amount);

            // Actual revenue
            var actualRevenue = harvests
                .Where(h => cropFieldIds.Contains(h.FieldId))
                .Sum(h => h.TotalRevenue ?? 0m);

            var actualMargin = actualRevenue - actualCosts;

            // Planned: proportional share of total budget based on area
            decimal plannedCosts = 0m;
            if (totalPlannedCosts > 0 && areaHa > 0)
            {
                var totalArea = fieldAreas.Sum(f => f.AreaHectares);
                plannedCosts = totalArea > 0
                    ? Math.Round(totalPlannedCosts * (areaHa / totalArea), 2)
                    : 0m;
            }

            // Planned margin: no planned revenue data available — leave as 0
            var plannedMargin = -plannedCosts;

            // Projected: area × average yield per ha × estimated price
            decimal? projectedRevenue = null;
            decimal? projectedMargin = null;

            if (request.EstimatedPricePerTonne.HasValue && areaHa > 0)
            {
                var avgYield = harvests
                    .Where(h => cropFieldIds.Contains(h.FieldId) && h.YieldTonsPerHa.HasValue)
                    .Select(h => h.YieldTonsPerHa!.Value)
                    .DefaultIfEmpty(0m)
                    .Average();

                if (avgYield > 0)
                {
                    projectedRevenue = Math.Round(areaHa * avgYield * request.EstimatedPricePerTonne.Value, 2);
                    projectedMargin = Math.Round(projectedRevenue.Value - plannedCosts, 2);
                }
            }

            result.Add(new MarginalityItemDto
            {
                CropName = cropName,
                AreaHa = areaHa,
                ActualRevenue = actualRevenue,
                ActualCosts = actualCosts,
                ActualMargin = actualMargin,
                PlannedCosts = plannedCosts,
                PlannedMargin = plannedMargin,
                ProjectedRevenue = projectedRevenue,
                ProjectedMargin = projectedMargin,
            });
        }

        return result;
    }
}
