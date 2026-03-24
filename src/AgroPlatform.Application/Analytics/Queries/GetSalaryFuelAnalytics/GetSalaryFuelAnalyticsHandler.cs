using AgroPlatform.Application.Analytics.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Analytics.Queries.GetSalaryFuelAnalytics;

public class GetSalaryFuelAnalyticsHandler : IRequestHandler<GetSalaryFuelAnalyticsQuery, SalaryFuelAnalyticsDto>
{
    private readonly IAppDbContext _context;

    public GetSalaryFuelAnalyticsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SalaryFuelAnalyticsDto> Handle(GetSalaryFuelAnalyticsQuery request, CancellationToken cancellationToken)
    {
        int year = request.Year ?? DateTime.UtcNow.Year;

        // Salary payments for the year
        var salaryPayments = await _context.SalaryPayments
            .Where(p => !p.IsDeleted && p.PaymentDate.Year == year)
            .Select(p => new { p.EmployeeId, p.Amount, Month = p.PaymentDate.Month })
            .ToListAsync(cancellationToken);

        // Employees lookup
        var employees = await _context.Employees
            .Where(e => !e.IsDeleted)
            .Select(e => new { e.Id, FullName = e.LastName + " " + e.FirstName, e.Position })
            .ToListAsync(cancellationToken);

        // Fuel issues for the year
        var fuelIssues = await _context.FuelTransactions
            .Where(t => !t.IsDeleted && t.TransactionType == "Issue" && t.TransactionDate.Year == year)
            .Select(t => new { t.MachineId, t.QuantityLiters, Month = t.TransactionDate.Month })
            .ToListAsync(cancellationToken);

        // Machines lookup
        var machines = await _context.Machines
            .Where(m => !m.IsDeleted)
            .Select(m => new { m.Id, m.Name })
            .ToListAsync(cancellationToken);

        // Total field area
        var totalAreaHa = await _context.Fields
            .Where(f => !f.IsDeleted)
            .SumAsync(f => f.AreaHectares, cancellationToken);

        // Total labor hours from work logs for the year
        var totalLaborHours = await _context.WorkLogs
            .Where(w => !w.IsDeleted && w.WorkDate.Year == year && w.HoursWorked.HasValue)
            .SumAsync(w => w.HoursWorked ?? 0m, cancellationToken);

        // Aggregate totals
        var totalSalary = salaryPayments.Sum(p => p.Amount);
        var totalFuelLiters = fuelIssues.Sum(f => f.QuantityLiters);

        // Monthly breakdowns
        var salaryByMonth = Enumerable.Range(1, 12)
            .Select(m => new MonthlyValueDto
            {
                Month = m,
                Value = salaryPayments.Where(p => p.Month == m).Sum(p => p.Amount),
            })
            .ToList();

        var fuelByMonth = Enumerable.Range(1, 12)
            .Select(m => new MonthlyValueDto
            {
                Month = m,
                Value = fuelIssues.Where(f => f.Month == m).Sum(f => f.QuantityLiters),
            })
            .ToList();

        // Fuel by machine
        var machineMap = machines.ToDictionary(m => m.Id);
        var fuelByMachine = fuelIssues
            .Where(f => f.MachineId.HasValue)
            .GroupBy(f => f.MachineId!.Value)
            .Select(g =>
            {
                var name = machineMap.TryGetValue(g.Key, out var machine) ? machine.Name : "Unknown";
                return new FuelByMachineDto
                {
                    MachineId = g.Key,
                    MachineName = name,
                    TotalLiters = g.Sum(f => f.QuantityLiters),
                };
            })
            .OrderByDescending(x => x.TotalLiters)
            .ToList();

        // Salary by employee
        var employeeMap = employees.ToDictionary(e => e.Id);
        var salaryByEmployee = salaryPayments
            .GroupBy(p => p.EmployeeId)
            .Select(g =>
            {
                employeeMap.TryGetValue(g.Key, out var emp);
                return new SalaryByEmployeeDto
                {
                    EmployeeId = g.Key,
                    EmployeeFullName = emp?.FullName ?? "Unknown",
                    Position = emp?.Position,
                    TotalAmount = g.Sum(p => p.Amount),
                };
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        // Computed ratios
        decimal? litersPerHectare = totalAreaHa > 0 ? totalFuelLiters / totalAreaHa : null;
        decimal? hectaresPerLaborHour = totalLaborHours > 0 ? totalAreaHa / totalLaborHours : null;

        return new SalaryFuelAnalyticsDto
        {
            Year = year,
            TotalSalary = totalSalary,
            TotalFuelLiters = totalFuelLiters,
            LitersPerHectare = litersPerHectare,
            HectaresPerLaborHour = hectaresPerLaborHour,
            SalaryByMonth = salaryByMonth,
            FuelByMonth = fuelByMonth,
            FuelByMachine = fuelByMachine,
            SalaryByEmployee = salaryByEmployee,
        };
    }
}
