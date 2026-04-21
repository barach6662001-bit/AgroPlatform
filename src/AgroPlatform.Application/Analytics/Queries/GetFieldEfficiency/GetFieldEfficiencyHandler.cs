using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetFieldEfficiency;

public class GetFieldEfficiencyHandler : IRequestHandler<GetFieldEfficiencyQuery, List<FieldEfficiencyDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldEfficiencyHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldEfficiencyDto>> Handle(GetFieldEfficiencyQuery request, CancellationToken cancellationToken)
    {
        var fields = await _context.Fields
            .Where(f => !f.IsDeleted)
            .ToListAsync(cancellationToken);

        var fieldIds = fields.Select(f => f.Id).ToList();

        var operationCounts = await _context.AgroOperations
            .Where(o => !o.IsDeleted && fieldIds.Contains(o.FieldId))
            .GroupBy(o => o.FieldId)
            .Select(g => new { FieldId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var costsByField = await _context.CostRecords
            .Where(c => !c.IsDeleted && c.FieldId.HasValue && fieldIds.Contains(c.FieldId!.Value))
            .GroupBy(c => c.FieldId!.Value)
            .Select(g => new { FieldId = g.Key, TotalCosts = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var yieldRows = await _context.FieldCropHistories
            .Where(h => !h.IsDeleted && fieldIds.Contains(h.FieldId) && h.YieldPerHectare.HasValue)
            .Select(h => new { h.FieldId, h.YieldPerHectare, h.Year })
            .ToListAsync(cancellationToken);

        var latestYields = yieldRows
            .GroupBy(h => h.FieldId)
            .Select(g => new { FieldId = g.Key, YieldPerHectare = g.OrderByDescending(h => h.Year).First().YieldPerHectare })
            .ToList();

        var opCountMap = operationCounts.ToDictionary(x => x.FieldId, x => x.Count);
        var costMap = costsByField.ToDictionary(x => x.FieldId, x => x.TotalCosts);
        var yieldMap = latestYields.ToDictionary(x => x.FieldId, x => x.YieldPerHectare);

        // Compute total harvest tons per field from crop history (yield × area)
        var harvestTonsMap = yieldRows
            .GroupBy(h => h.FieldId)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var latestYield = g.OrderByDescending(h => h.Year).First().YieldPerHectare;
                    var field = fields.FirstOrDefault(f => f.Id == g.Key);
                    return latestYield.HasValue && field != null
                        ? (decimal?)(latestYield.Value * field.AreaHectares)
                        : null;
                });

        return fields.Select(f =>
        {
            var costs = costMap.GetValueOrDefault(f.Id, 0m);
            var totalHarvestTons = harvestTonsMap.GetValueOrDefault(f.Id);
            return new FieldEfficiencyDto
            {
                FieldId = f.Id,
                FieldName = f.Name,
                AreaHectares = f.AreaHectares,
                CurrentCrop = f.CurrentCrop?.ToString(),
                OperationsCount = opCountMap.GetValueOrDefault(f.Id, 0),
                TotalCosts = costs,
                CostPerHectare = f.AreaHectares > 0 ? Math.Round(costs / f.AreaHectares, 2) : 0m,
                YieldPerHectare = yieldMap.GetValueOrDefault(f.Id),
                TotalHarvestTons = totalHarvestTons.HasValue ? Math.Round(totalHarvestTons.Value, 1) : null,
            };
        })
        .OrderBy(d => d.FieldName)
        .ToList();
    }
}
