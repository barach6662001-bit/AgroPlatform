using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.HR;

public class Employee : AuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Department { get; set; }
    public DateTime HireDate { get; set; }
    public decimal Salary { get; set; }
    public string Currency { get; set; } = "UAH";
}
