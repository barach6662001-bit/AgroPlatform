using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetFuelAnalytics;

public class GetFuelAnalyticsHandler : IRequestHandler<GetFuelAnalyticsQuery, FuelAnalyticsDto>
{
    private readonly IAppDbContext _context;

    public GetFuelAnalyticsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<FuelAnalyticsDto> Handle(GetFuelAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var dto = new FuelAnalyticsDto();

        // ── Fuel consumed per machine (from FuelLog) ──────────────────────────
        var fuelByMachine = await _context.FuelLogs
            .Where(l => !l.IsDeleted)
            .GroupBy(l => l.MachineId)
            .Select(g => new { MachineId = g.Key, TotalFuel = g.Sum(l => l.Quantity) })
            .ToListAsync(cancellationToken);

        // ── Area processed per machine (via AgroOperationMachinery → AgroOperation) ─
        var agroMachinery = await _context.AgroOperationMachineries
            .Where(m => !m.IsDeleted)
            .Select(m => new { m.MachineId, m.AgroOperationId })
            .ToListAsync(cancellationToken);

        var operationAreaMap = await _context.AgroOperations
            .Where(o => !o.IsDeleted && o.AreaProcessed.HasValue)
            .Select(o => new { o.Id, Area = o.AreaProcessed!.Value })
            .ToListAsync(cancellationToken);

        var areaDict = operationAreaMap.ToDictionary(o => o.Id, o => o.Area);

        var areaByMachine = agroMachinery
            .GroupBy(m => m.MachineId)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(m => areaDict.TryGetValue(m.AgroOperationId, out var area) ? area : 0m));

        // ── Work hours per machine ────────────────────────────────────────────
        var hoursByMachine = await _context.MachineWorkLogs
            .Where(l => !l.IsDeleted)
            .GroupBy(l => l.MachineId)
            .Select(g => new { MachineId = g.Key, TotalHours = g.Sum(l => l.HoursWorked) })
            .ToListAsync(cancellationToken);

        var hoursDict = hoursByMachine.ToDictionary(x => x.MachineId, x => x.TotalHours);

        // ── Machine names ─────────────────────────────────────────────────────
        var machineIds = fuelByMachine.Select(x => x.MachineId).ToList();
        var machines = await _context.Machines
            .Where(m => !m.IsDeleted && machineIds.Contains(m.Id))
            .ToListAsync(cancellationToken);

        var machineDict = machines.ToDictionary(m => m.Id);

        dto.PerMachine = fuelByMachine
            .Where(f => machineDict.ContainsKey(f.MachineId))
            .Select(f =>
            {
                var machine = machineDict[f.MachineId];
                var totalArea = areaByMachine.GetValueOrDefault(f.MachineId, 0m);
                return new FuelConsumptionPerMachineDto
                {
                    MachineId = machine.Id,
                    MachineName = machine.Name,
                    MachineType = machine.Type.ToString(),
                    TotalFuelLiters = f.TotalFuel,
                    TotalAreaHectares = totalArea,
                    LitersPerHectare = totalArea > 0 ? Math.Round(f.TotalFuel / totalArea, 2) : 0m,
                    TotalHoursWorked = hoursDict.GetValueOrDefault(f.MachineId, 0m),
                };
            })
            .OrderByDescending(x => x.TotalFuelLiters)
            .ToList();

        // ── Monthly fuel trend (last 12 months) ───────────────────────────────
        var cutoff = DateTime.UtcNow.AddMonths(-12);
        dto.MonthlyTrend = await _context.FuelLogs
            .Where(l => !l.IsDeleted && l.Date >= cutoff)
            .GroupBy(l => new { l.Date.Year, l.Date.Month })
            .Select(g => new MonthlyFuelTrendDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalLiters = g.Sum(l => l.Quantity),
            })
            .OrderBy(t => t.Year).ThenBy(t => t.Month)
            .ToListAsync(cancellationToken);

        return dto;
    }
}
