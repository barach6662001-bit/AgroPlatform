namespace AgroPlatform.Application.HR.DTOs;

public class WorkLogDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal? HoursWorked { get; set; }
    public decimal? UnitsProduced { get; set; }
    public string? WorkDescription { get; set; }
    public Guid? FieldId { get; set; }
    public Guid? OperationId { get; set; }
    public decimal AccruedAmount { get; set; }
    public bool IsPaid { get; set; }
}
