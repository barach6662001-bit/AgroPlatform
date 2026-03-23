using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetResourceEfficiency;

public class GetResourceEfficiencyHandler
    : IRequestHandler<GetResourceEfficiencyQuery, ResourceEfficiencyDto>
{
    private readonly IAppDbContext _context;

    public GetResourceEfficiencyHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ResourceEfficiencyDto> Handle(
        GetResourceEfficiencyQuery request,
        CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;

        // ── Salary payments (cash paid out) ──────────────────────────────────
        var salaryPayments = await _context.SalaryPayments
            .Where(p => !p.IsDeleted && p.PaymentDate.Year == year)
            .Select(p => new { p.EmployeeId, p.Amount, p.PaymentDate })
            .ToListAsync(cancellationToken);

        // ── Work logs (accrued wages & hours worked) ──────────────────────────
        var workLogs = await _context.WorkLogs
            .Where(w => !w.IsDeleted && w.WorkDate.Year == year)
            .Select(w => new { w.EmployeeId, w.AccruedAmount, w.HoursWorked, w.WorkDate })
            .ToListAsync(cancellationToken);

        // ── Fuel logs ─────────────────────────────────────────────────────────
        var fuelLogs = await _context.FuelLogs
            .Where(f => !f.IsDeleted && f.Date.Year == year)
            .Select(f => new { f.MachineId, f.Quantity, f.Date })
            .ToListAsync(cancellationToken);

        // ── Machine work logs (hours per machine) ─────────────────────────────
        var machineWorkLogs = await _context.MachineWorkLogs
            .Where(m => !m.IsDeleted && m.Date.Year == year)
            .Select(m => new { m.MachineId, m.HoursWorked })
            .ToListAsync(cancellationToken);

        // ── Employees (for display names) ─────────────────────────────────────
        var employeeIds = salaryPayments.Select(p => p.EmployeeId)
            .Union(workLogs.Select(w => w.EmployeeId))
            .Distinct()
            .ToList();

        var employees = await _context.Employees
            .Where(e => employeeIds.Contains(e.Id))
            .Select(e => new { e.Id, e.FirstName, e.LastName })
            .ToListAsync(cancellationToken);

        var employeeNameMap = employees.ToDictionary(
            e => e.Id,
            e => $"{e.FirstName} {e.LastName}".Trim());

        // ── Machines (for display names) ──────────────────────────────────────
        var machineIds = fuelLogs.Select(f => f.MachineId)
            .Union(machineWorkLogs.Select(m => m.MachineId))
            .Distinct()
            .ToList();

        var machines = await _context.Machines
            .Where(m => machineIds.Contains(m.Id))
            .Select(m => new { m.Id, m.Name })
            .ToListAsync(cancellationToken);

        var machineNameMap = machines.ToDictionary(m => m.Id, m => m.Name);

        // ── Field area for efficiency ratios ──────────────────────────────────
        // Total area of fields that had at least one AgroOperation this year
        var operationFieldIds = await _context.AgroOperations
            .Where(o => !o.IsDeleted && o.CreatedAtUtc.Year == year)
            .Select(o => o.FieldId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var totalFieldArea = operationFieldIds.Count > 0
            ? await _context.Fields
                .Where(f => !f.IsDeleted && operationFieldIds.Contains(f.Id))
                .SumAsync(f => f.AreaHectares, cancellationToken)
            : 0m;

        // ── Aggregates ────────────────────────────────────────────────────────
        var totalSalaryPaid = salaryPayments.Sum(p => p.Amount);
        var totalAccrued = workLogs.Sum(w => w.AccruedAmount);
        var totalFuelLiters = fuelLogs.Sum(f => f.Quantity);
        var totalLaborHours = workLogs.Sum(w => w.HoursWorked ?? 0m);

        decimal? litersPerHectare = totalFieldArea > 0 && totalFuelLiters > 0
            ? Math.Round(totalFuelLiters / totalFieldArea, 2)
            : null;

        decimal? hectaresPerLaborHour = totalLaborHours > 0 && totalFieldArea > 0
            ? Math.Round(totalFieldArea / totalLaborHours, 4)
            : null;

        // ── Salary by employee ─────────────────────────────────────────────────
        var paidByEmployee = salaryPayments
            .GroupBy(p => p.EmployeeId)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));

        var accruedByEmployee = workLogs
            .GroupBy(w => w.EmployeeId)
            .ToDictionary(g => g.Key, g => (Accrued: g.Sum(w => w.AccruedAmount), Hours: g.Sum(w => w.HoursWorked ?? 0m)));

        var allEmployeeIds = paidByEmployee.Keys.Union(accruedByEmployee.Keys).Distinct();

        var salaryByEmployee = allEmployeeIds
            .Select(id => new SalaryByEmployeeDto
            {
                EmployeeId = id,
                EmployeeName = employeeNameMap.GetValueOrDefault(id, id.ToString()),
                TotalPaid = paidByEmployee.GetValueOrDefault(id),
                TotalAccrued = accruedByEmployee.TryGetValue(id, out var e) ? e.Accrued : 0m,
                TotalHours = accruedByEmployee.TryGetValue(id, out var h) ? h.Hours : 0m,
            })
            .OrderByDescending(e => e.TotalPaid + e.TotalAccrued)
            .ToList();

        // ── Salary by month ────────────────────────────────────────────────────
        var salaryByMonth = salaryPayments
            .GroupBy(p => p.PaymentDate.Month)
            .Select(g => new MonthlyValueDto { Year = year, Month = g.Key, Value = g.Sum(p => p.Amount) })
            .OrderBy(m => m.Month)
            .ToList();

        // ── Fuel by machine ────────────────────────────────────────────────────
        var fuelByMachineDict = fuelLogs
            .GroupBy(f => f.MachineId)
            .ToDictionary(g => g.Key, g => g.Sum(f => f.Quantity));

        var hoursByMachineDict = machineWorkLogs
            .GroupBy(m => m.MachineId)
            .ToDictionary(g => g.Key, g => g.Sum(m => m.HoursWorked));

        var allMachineIds = fuelByMachineDict.Keys.Union(hoursByMachineDict.Keys).Distinct();

        var fuelByMachine = allMachineIds
            .Select(id =>
            {
                var liters = fuelByMachineDict.GetValueOrDefault(id);
                var hours = hoursByMachineDict.GetValueOrDefault(id);
                return new FuelByMachineDto
                {
                    MachineId = id,
                    MachineName = machineNameMap.GetValueOrDefault(id, id.ToString()),
                    TotalLiters = liters,
                    TotalHoursWorked = hours,
                    LitersPerHour = hours > 0 ? Math.Round(liters / hours, 2) : null,
                };
            })
            .OrderByDescending(m => m.TotalLiters)
            .ToList();

        // ── Fuel by month ──────────────────────────────────────────────────────
        var fuelByMonth = fuelLogs
            .GroupBy(f => f.Date.Month)
            .Select(g => new MonthlyValueDto { Year = year, Month = g.Key, Value = g.Sum(f => f.Quantity) })
            .OrderBy(m => m.Month)
            .ToList();

        return new ResourceEfficiencyDto
        {
            TotalSalaryPayments = totalSalaryPaid,
            TotalAccruedWages = totalAccrued,
            TotalFuelLiters = totalFuelLiters,
            TotalLaborHours = totalLaborHours,
            LitersPerHectare = litersPerHectare,
            HectaresPerLaborHour = hectaresPerLaborHour,
            SalaryByEmployee = salaryByEmployee,
            SalaryByMonth = salaryByMonth,
            FuelByMachine = fuelByMachine,
            FuelByMonth = fuelByMonth,
        };
    }
}
