using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.HR;

public class Employee : AuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string SalaryType { get; set; } = "Hourly"; // "Hourly" or "Piecework"
    public decimal? HourlyRate { get; set; }
    public decimal? PieceworkRate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
    public ICollection<SalaryPayment> Payments { get; set; } = new List<SalaryPayment>();
}
