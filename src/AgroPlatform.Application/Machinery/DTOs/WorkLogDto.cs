namespace AgroPlatform.Application.Machinery.DTOs;

public class WorkLogDto
{
    public Guid Id { get; set; }
    public Guid MachineId { get; set; }
    public DateTime Date { get; set; }
    public decimal HoursWorked { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Description { get; set; }
}
