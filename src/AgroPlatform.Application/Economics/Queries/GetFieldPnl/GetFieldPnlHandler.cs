using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetFieldPnl;

public class GetFieldPnlHandler : IRequestHandler<GetFieldPnlQuery, IReadOnlyList<FieldPnlDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldPnlHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FieldPnlDto>> Handle(GetFieldPnlQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        // Load fields (tenant filter applied via global query filter in AppDbContext)
        var fieldsQuery = _context.Fields.Where(f => !f.IsDeleted);
        if (request.FieldId.HasValue)
            fieldsQuery = fieldsQuery.Where(f => f.Id == request.FieldId.Value);

        var fields = await fieldsQuery
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);

        if (fields.Count == 0)
            return Array.Empty<FieldPnlDto>();

        var fieldIds = fields.Select(f => f.Id).ToList();

        // Load cost records for the year
        var costRecords = await _context.CostRecords
            .Where(c => !c.IsDeleted
                        && c.FieldId.HasValue
                        && fieldIds.Contains(c.FieldId!.Value)
                        && c.Date >= yearStart
                        && c.Date <= yearEnd)
            .Select(c => new { c.FieldId, c.Category, c.Amount })
            .ToListAsync(cancellationToken);

        // Prefer FieldHarvests (synced from grain storage) over FieldCropHistory
        var harvestYields = await _context.FieldHarvests
            .Where(h => !h.IsDeleted && fieldIds.Contains(h.FieldId) && h.Year == year)
            .Select(h => new { h.FieldId, YieldPerHectare = h.YieldTonsPerHa })
            .ToListAsync(cancellationToken);

        // Fallback to FieldCropHistory for fields without harvests
        var fieldsWithHarvest = harvestYields.Select(h => h.FieldId).ToHashSet();
        var fallbackYields = await _context.FieldCropHistories
            .Where(h => !h.IsDeleted
                && fieldIds.Contains(h.FieldId)
                && !fieldsWithHarvest.Contains(h.FieldId)
                && h.Year == year)
            .Select(h => new { h.FieldId, YieldPerHectare = (decimal?)h.YieldPerHectare })
            .ToListAsync(cancellationToken);

        var yieldHistory = harvestYields.Concat(fallbackYields).ToList();

        // Load direct sales revenue by field for the year
        var salesByField = await _context.Sales
            .Where(s => !s.IsDeleted
                        && s.FieldId.HasValue
                        && fieldIds.Contains(s.FieldId!.Value)
                        && s.Date >= yearStart
                        && s.Date <= yearEnd)
            .GroupBy(s => s.FieldId!.Value)
            .Select(g => new { FieldId = g.Key, TotalRevenue = g.Sum(s => s.TotalAmount) })
            .ToListAsync(cancellationToken);

        var salesRevenueMap = salesByField.ToDictionary(x => x.FieldId, x => x.TotalRevenue);

        // Build result
        var result = new List<FieldPnlDto>(fields.Count);

        foreach (var field in fields)
        {
            var fieldCosts = costRecords.Where(c => c.FieldId == field.Id).ToList();

            // Separate expenses (positive) and cost-record revenue (negative amounts)
            var expenses = fieldCosts.Where(c => c.Amount > 0).Sum(c => c.Amount);
            var costRecordRevenue = fieldCosts.Where(c => c.Amount < 0).Sum(c => Math.Abs(c.Amount));

            var costsByCategory = fieldCosts
                .Where(c => c.Amount > 0)
                .GroupBy(c => c.Category)
                .ToDictionary(g => g.Key.ToString(), g => g.Sum(c => c.Amount));

            var yieldRecord = yieldHistory.FirstOrDefault(h => h.FieldId == field.Id);
            var yieldPerHectare = yieldRecord?.YieldPerHectare;
            var actualYieldTons = yieldPerHectare.HasValue && field.AreaHectares > 0
                ? Math.Round(yieldPerHectare.Value * field.AreaHectares, 2)
                : (decimal?)null;

            // Estimated revenue from yield × price
            decimal? yieldEstimatedRevenue = null;
            if (yieldPerHectare.HasValue && request.EstimatedPricePerTonne.HasValue && field.AreaHectares > 0)
                yieldEstimatedRevenue = Math.Round(yieldPerHectare.Value * field.AreaHectares * request.EstimatedPricePerTonne.Value, 2);

            // Revenue priority: Sales > CostRecord negatives > Estimated
            salesRevenueMap.TryGetValue(field.Id, out var salesRevenue);
            string revenueSource;
            decimal? bestRevenue;

            if (salesRevenue > 0)
            {
                bestRevenue = salesRevenue;
                revenueSource = "Sales";
            }
            else if (costRecordRevenue > 0)
            {
                bestRevenue = costRecordRevenue;
                revenueSource = "CostRecords";
            }
            else if (yieldEstimatedRevenue.HasValue)
            {
                bestRevenue = yieldEstimatedRevenue;
                revenueSource = "Estimated";
            }
            else
            {
                bestRevenue = null;
                revenueSource = "None";
            }

            decimal? finalNetProfit = bestRevenue.HasValue ? Math.Round(bestRevenue.Value - expenses, 2) : (decimal?)null;
            decimal? finalRevenuePerHa = bestRevenue.HasValue && field.AreaHectares > 0
                ? Math.Round(bestRevenue.Value / field.AreaHectares, 2)
                : (decimal?)null;

            result.Add(new FieldPnlDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                AreaHectares = field.AreaHectares,
                CurrentCrop = field.CurrentCrop?.ToString(),
                TotalCosts = expenses,
                CostsByCategory = costsByCategory,
                CostPerHectare = field.AreaHectares > 0 ? Math.Round(expenses / field.AreaHectares, 2) : 0,
                ActualYieldPerHectare = yieldPerHectare,
                ActualYieldTons = actualYieldTons,
                ActualSalesRevenue = salesRevenue,
                ActualCostRecordRevenue = costRecordRevenue,
                EstimatedRevenue = bestRevenue,
                NetProfit = finalNetProfit,
                RevenuePerHectare = finalRevenuePerHa,
                RevenueSource = revenueSource,
            });
        }

        return result;
    }
}
