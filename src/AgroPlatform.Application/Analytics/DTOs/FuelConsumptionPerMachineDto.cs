namespace AgroPlatform.Application.Analytics.DTOs;

public class FuelConsumptionPerMachineDto
{
    public Guid MachineId { get; set; }
    public string MachineName { get; set; } = string.Empty;
    public string? MachineType { get; set; }
    public decimal TotalFuelLiters { get; set; }
    public decimal TotalAreaHectares { get; set; }
    public decimal LitersPerHectare { get; set; }
    public decimal TotalHoursWorked { get; set; }
}
