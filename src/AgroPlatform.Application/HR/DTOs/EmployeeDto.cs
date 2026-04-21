namespace AgroPlatform.Application.HR.DTOs;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string SalaryType { get; set; } = "Hourly";
    public decimal? HourlyRate { get; set; }
    public decimal? PieceworkRate { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
}
