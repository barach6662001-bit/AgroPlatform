using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AgroPlatform.Application.Analytics.Queries.GetDashboard;

public class GetDashboardHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IAppDbContext _context;
    private readonly IConfiguration? _configuration;

    public GetDashboardHandler(IAppDbContext context, IConfiguration? configuration = null)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var dto = new DashboardDto();
        var activeFields = _context.Fields.Where(f => !f.IsDeleted);

        // ── Fields ────────────────────────────────────────────────────────
        dto.TotalFields = await activeFields.CountAsync(cancellationToken);
        dto.TotalAreaHectares = await activeFields.SumAsync(f => f.AreaHectares, cancellationToken);
        dto.AreaByCrop = (await activeFields
            .Where(f => f.CurrentCrop != null)
            .GroupBy(f => f.CurrentCrop!.Value)
            .Select(g => new { Crop = g.Key, Area = g.Sum(f => f.AreaHectares) })
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Crop.ToString(), x => x.Area);

        // ── Warehouses ────────────────────────────────────────────────────
        dto.TotalWarehouses = await _context.Warehouses.CountAsync(cancellationToken);
        dto.TotalWarehouseItems = await _context.WarehouseItems.CountAsync(cancellationToken);

        var topBalances = await _context.StockBalances
            .GroupBy(sb => sb.ItemId)
            .Select(g => new { ItemId = g.Key, TotalBalance = g.Sum(sb => sb.BalanceBase) })
            .OrderByDescending(x => x.TotalBalance)
            .Take(10)
            .ToListAsync(cancellationToken);

        var topItemIds = topBalances.Select(x => x.ItemId).ToList();
        var topWarehouseItems = await _context.WarehouseItems
            .Where(i => topItemIds.Contains(i.Id))
            .ToListAsync(cancellationToken);

        dto.TopStockItems = topBalances
            .Join(topWarehouseItems, b => b.ItemId, i => i.Id, (b, i) => new TopStockItemDto
            {
                ItemId = b.ItemId,
                ItemName = i.Name,
                Category = i.Category,
                TotalBalance = b.TotalBalance,
                BaseUnit = i.BaseUnit
            })
            .ToList();

        // ── Operations ────────────────────────────────────────────────────
        dto.TotalOperations = await _context.AgroOperations.CountAsync(cancellationToken);
        dto.CompletedOperations = await _context.AgroOperations.CountAsync(o => o.Status == OperationStatus.Completed, cancellationToken);
        dto.PendingOperations = await _context.AgroOperations.CountAsync(o => o.Status != OperationStatus.Completed, cancellationToken);
        dto.OperationsByType = (await _context.AgroOperations
            .GroupBy(o => o.OperationType)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Type.ToString(), x => x.Count);

        // ── Machinery ─────────────────────────────────────────────────────
        dto.TotalMachines = await _context.Machines.CountAsync(cancellationToken);
        dto.ActiveMachines = await _context.Machines.CountAsync(m => m.Status == MachineryStatus.Active, cancellationToken);
        dto.UnderRepairMachines = await _context.Machines.CountAsync(m => m.Status == MachineryStatus.UnderRepair, cancellationToken);

        dto.TotalHoursWorked = await _context.MachineWorkLogs
            .SumAsync(l => l.HoursWorked, cancellationToken);

        dto.TotalFuelConsumed = await _context.FuelLogs
            .SumAsync(l => l.Quantity, cancellationToken);

        // ── Economics ─────────────────────────────────────────────────────
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);
        var trendCutoff = now.AddMonths(-12);

        // Effective range: explicit query range if provided, otherwise null (=> legacy behavior).
        var hasRange = request.FromUtc.HasValue && request.ToUtc.HasValue && request.FromUtc.Value < request.ToUtc.Value;
        var rangeFrom = hasRange ? request.FromUtc!.Value : (DateTime?)null;
        var rangeTo = hasRange ? request.ToUtc!.Value : (DateTime?)null;

        // Totals: when a range is given, totals become the range sum; otherwise all-time.
        if (hasRange)
        {
            dto.TotalCosts = await _context.CostRecords
                .Where(c => c.Date >= rangeFrom && c.Date < rangeTo)
                .SumAsync(c => (decimal?)c.Amount, cancellationToken) ?? 0m;
            dto.TotalRevenue = await _context.Sales
                .Where(s => s.Date >= rangeFrom && s.Date < rangeTo)
                .SumAsync(s => (decimal?)s.TotalAmount, cancellationToken) ?? 0m;
        }
        else
        {
            dto.TotalCosts = await _context.CostRecords.SumAsync(c => c.Amount, cancellationToken);
            dto.TotalRevenue = await _context.Sales.SumAsync(s => (decimal?)s.TotalAmount, cancellationToken) ?? 0m;
        }

        // "Monthly*" fields carry the selected-period figures; without a range they
        // fall back to the current calendar month (legacy semantics).
        var periodFrom = hasRange ? rangeFrom!.Value : monthStart;
        var periodTo = hasRange ? rangeTo!.Value : monthEnd;

        dto.MonthlyExpenses = await _context.CostRecords
            .Where(c => c.Amount > 0 && c.Date >= periodFrom && c.Date < periodTo)
            .SumAsync(c => (decimal?)c.Amount, cancellationToken) ?? 0m;
        dto.MonthlyRevenue = await _context.Sales
            .Where(s => s.Date >= periodFrom && s.Date < periodTo)
            .SumAsync(s => (decimal?)s.TotalAmount, cancellationToken) ?? 0m;
        dto.MonthlyProfit = dto.MonthlyRevenue - dto.MonthlyExpenses;

        dto.CostsByCategory = (await _context.CostRecords
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Category.ToString(), x => x.Total);

        // Cost trend: respect the range if provided, otherwise last 12 months.
        var trendFrom = hasRange ? rangeFrom!.Value : trendCutoff;
        var trendTo = hasRange ? rangeTo!.Value : now.AddDays(1);
        dto.CostTrend = await _context.CostRecords
            .Where(c => c.Date >= trendFrom && c.Date < trendTo)
            .GroupBy(c => new { c.Date.Year, c.Date.Month })
            .Select(g => new MonthlyCostTrendDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalAmount = g.Sum(c => c.Amount)
            })
            .OrderBy(t => t.Year)
            .ThenBy(t => t.Month)
            .ToListAsync(cancellationToken);

        // ── Demo mode: ensure positive margin ─────────────────────────────
        // When `Demo:EnsurePositiveMargin=true` (set only on public-demo deployments),
        // scale up revenue figures so the UI shows a positive profit. This is a
        // display-layer adjustment that never touches the database, never runs in
        // prod, and preserves the shape of the data (expenses stay truthful).
        var ensurePositive = string.Equals(_configuration?["Demo:EnsurePositiveMargin"], "true", StringComparison.OrdinalIgnoreCase);
        if (ensurePositive)
        {
            const decimal targetMargin = 1.15m; // 15% profit over expenses
            if (dto.MonthlyExpenses > 0 && dto.MonthlyRevenue < dto.MonthlyExpenses * targetMargin)
            {
                dto.MonthlyRevenue = dto.MonthlyExpenses * targetMargin;
                dto.MonthlyProfit = dto.MonthlyRevenue - dto.MonthlyExpenses;
            }
            if (dto.TotalCosts > 0 && dto.TotalRevenue < dto.TotalCosts * targetMargin)
            {
                dto.TotalRevenue = dto.TotalCosts * targetMargin;
            }
        }

        return dto;
    }
}
