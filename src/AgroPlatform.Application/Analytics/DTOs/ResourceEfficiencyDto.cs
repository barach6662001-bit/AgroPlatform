namespace AgroPlatform.Application.Analytics.DTOs;

public record ResourceEfficiencyDto
{
    // ── KPI totals ──────────────────────────────────────────────────────────
    public decimal TotalSalaryPayments { get; init; }
    public decimal TotalAccruedWages { get; init; }
    public decimal TotalFuelLiters { get; init; }
    public decimal TotalLaborHours { get; init; }

    // ── Efficiency ratios (null when no area / hours data available) ────────
    public decimal? LitersPerHectare { get; init; }
    public decimal? HectaresPerLaborHour { get; init; }

    // ── Salary breakdown ────────────────────────────────────────────────────
    public List<SalaryByEmployeeDto> SalaryByEmployee { get; init; } = [];
    public List<MonthlyValueDto> SalaryByMonth { get; init; } = [];

    // ── Fuel breakdown ──────────────────────────────────────────────────────
    public List<FuelByMachineDto> FuelByMachine { get; init; } = [];
    public List<MonthlyValueDto> FuelByMonth { get; init; } = [];
}

public record SalaryByEmployeeDto
{
    public Guid EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public decimal TotalPaid { get; init; }
    public decimal TotalAccrued { get; init; }
    public decimal TotalHours { get; init; }
}

public record FuelByMachineDto
{
    public Guid MachineId { get; init; }
    public string MachineName { get; init; } = string.Empty;
    public decimal TotalLiters { get; init; }
    public decimal TotalHoursWorked { get; init; }
    public decimal? LitersPerHour { get; init; }
}

public record MonthlyValueDto
{
    public int Year { get; init; }
    public int Month { get; init; }
    public decimal Value { get; init; }
}
