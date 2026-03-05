namespace AgroPlatform.Application.AgroOperations.DTOs;

public class AgroOperationMachineryDto
{
    public Guid Id { get; set; }
    public Guid MachineId { get; set; }
    public string MachineName { get; set; } = string.Empty;
    public decimal? HoursWorked { get; set; }
    public decimal? FuelUsed { get; set; }
    public string? OperatorName { get; set; }
}
