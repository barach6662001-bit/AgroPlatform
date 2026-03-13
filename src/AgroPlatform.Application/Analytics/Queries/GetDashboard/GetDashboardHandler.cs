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

        // ── Fields ────────────────────────────────────────────────────────
        var fields = await _context.Fields
            .Where(f => !f.IsDeleted)
            .ToListAsync(cancellationToken);

        dto.TotalFields = fields.Count;
        dto.TotalAreaHectares = fields.Sum(f => f.AreaHectares);
        dto.AreaByCrop = fields
            .Where(f => f.CurrentCrop.HasValue)
            .GroupBy(f => f.CurrentCrop!.Value.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(f => f.AreaHectares));

        // ── Warehouses ────────────────────────────────────────────────────
        dto.TotalWarehouses = await _context.Warehouses
            .CountAsync(w => !w.IsDeleted, cancellationToken);

        dto.TotalWarehouseItems = await _context.WarehouseItems
            .CountAsync(i => !i.IsDeleted, cancellationToken);

        var topBalances = await _context.StockBalances
            .GroupBy(sb => sb.ItemId)
            .Select(g => new { ItemId = g.Key, TotalBalance = g.Sum(sb => sb.BalanceBase) })
            .OrderByDescending(x => x.TotalBalance)
            .Take(10)
            .ToListAsync(cancellationToken);

        var topItemIds = topBalances.Select(x => x.ItemId).ToList();
        var topWarehouseItems = await _context.WarehouseItems
            .Where(i => !i.IsDeleted && topItemIds.Contains(i.Id))
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
        var operations = await _context.AgroOperations
            .Where(o => !o.IsDeleted)
            .ToListAsync(cancellationToken);

        dto.TotalOperations = operations.Count;
        dto.CompletedOperations = operations.Count(o => o.IsCompleted);
        dto.PendingOperations = operations.Count(o => !o.IsCompleted);
        dto.OperationsByType = operations
            .GroupBy(o => o.OperationType.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        // ── Machinery ─────────────────────────────────────────────────────
        var machines = await _context.Machines
            .Where(m => !m.IsDeleted)
            .ToListAsync(cancellationToken);

        dto.TotalMachines = machines.Count;
        dto.ActiveMachines = machines.Count(m => m.Status == MachineryStatus.Active);
        dto.UnderRepairMachines = machines.Count(m => m.Status == MachineryStatus.UnderRepair);

        dto.TotalHoursWorked = await _context.MachineWorkLogs
            .Where(l => !l.IsDeleted)
            .SumAsync(l => l.HoursWorked, cancellationToken);

        dto.TotalFuelConsumed = await _context.FuelLogs
            .Where(l => !l.IsDeleted)
            .SumAsync(l => l.Quantity, cancellationToken);

        // ── Economics ─────────────────────────────────────────────────────
        var cutoff = DateTime.UtcNow.AddMonths(-12);

        var costRecords = await _context.CostRecords
            .Where(c => !c.IsDeleted)
            .ToListAsync(cancellationToken);

        dto.TotalCosts = costRecords.Sum(c => c.Amount);
        dto.CostsByCategory = costRecords
            .GroupBy(c => c.Category)
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        dto.CostTrend = costRecords
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
            .ToList();

        return dto;
    }
}
