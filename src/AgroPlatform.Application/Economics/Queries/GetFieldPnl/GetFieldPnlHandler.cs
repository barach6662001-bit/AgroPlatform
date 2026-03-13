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

        // Load yield history for the year
        var yieldHistory = await _context.FieldCropHistories
            .Where(h => !h.IsDeleted
                        && fieldIds.Contains(h.FieldId)
                        && h.Year == year)
            .Select(h => new { h.FieldId, h.YieldPerHectare })
            .ToListAsync(cancellationToken);

        // Build result
        var result = new List<FieldPnlDto>(fields.Count);

        foreach (var field in fields)
        {
            var fieldCosts = costRecords.Where(c => c.FieldId == field.Id).ToList();
            var totalCosts = fieldCosts.Sum(c => c.Amount);

            var costsByCategory = fieldCosts
                .GroupBy(c => c.Category)
                .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

            var yieldRecord = yieldHistory.FirstOrDefault(h => h.FieldId == field.Id);
            var yieldPerHectare = yieldRecord?.YieldPerHectare;

            decimal? estimatedRevenue = null;
            decimal? netProfit = null;
            decimal? revenuePerHectare = null;

            if (yieldPerHectare.HasValue && request.EstimatedPricePerTonne.HasValue && field.AreaHectares > 0)
            {
                estimatedRevenue = Math.Round(yieldPerHectare.Value * field.AreaHectares * request.EstimatedPricePerTonne.Value, 2);
                netProfit = Math.Round(estimatedRevenue.Value - totalCosts, 2);
                revenuePerHectare = Math.Round(estimatedRevenue.Value / field.AreaHectares, 2);
            }

            result.Add(new FieldPnlDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                AreaHectares = field.AreaHectares,
                CurrentCrop = field.CurrentCrop?.ToString(),
                TotalCosts = totalCosts,
                CostsByCategory = costsByCategory,
                CostPerHectare = field.AreaHectares > 0 ? Math.Round(totalCosts / field.AreaHectares, 2) : 0,
                ActualYieldPerHectare = yieldPerHectare,
                EstimatedRevenue = estimatedRevenue,
                NetProfit = netProfit,
                RevenuePerHectare = revenuePerHectare,
            });
        }

        return result;
    }
}
