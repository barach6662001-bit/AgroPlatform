namespace AgroPlatform.Application.Analytics.DTOs;

public class SalaryFuelAnalyticsDto
{
    public int Year { get; set; }
    public decimal TotalSalary { get; set; }
    public decimal TotalFuelLiters { get; set; }
    public decimal? LitersPerHectare { get; set; }
    public decimal? HectaresPerLaborHour { get; set; }

    public List<MonthlyValueDto> SalaryByMonth { get; set; } = new();
    public List<MonthlyValueDto> FuelByMonth { get; set; } = new();
    public List<FuelByMachineDto> FuelByMachine { get; set; } = new();
    public List<SalaryByEmployeeDto> SalaryByEmployee { get; set; } = new();
}

public class MonthlyValueDto
{
    public int Month { get; set; }
    public decimal Value { get; set; }
}

public class FuelByMachineDto
{
    public Guid MachineId { get; set; }
    public string MachineName { get; set; } = string.Empty;
    public decimal TotalLiters { get; set; }
}

public class SalaryByEmployeeDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeFullName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public decimal TotalAmount { get; set; }
}
