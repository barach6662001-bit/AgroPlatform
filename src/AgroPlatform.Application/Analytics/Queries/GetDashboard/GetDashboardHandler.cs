using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetDashboard;

public class GetDashboardHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IAppDbContext _context;

    public GetDashboardHandler(IAppDbContext context)
    {
        _context = context;
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
        dto.CompletedOperations = await _context.AgroOperations.CountAsync(o => o.IsCompleted, cancellationToken);
        dto.PendingOperations = await _context.AgroOperations.CountAsync(o => !o.IsCompleted, cancellationToken);
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
        var cutoff = DateTime.UtcNow.AddMonths(-12);

        dto.TotalCosts = await _context.CostRecords.SumAsync(c => c.Amount, cancellationToken);
        dto.CostsByCategory = (await _context.CostRecords
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Category.ToString(), x => x.Total);

        dto.CostTrend = await _context.CostRecords
            .Where(c => c.Date >= cutoff)
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

        return dto;
    }
}
