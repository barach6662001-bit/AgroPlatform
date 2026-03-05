using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Machinery.DTOs;

public class MachineDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InventoryNumber { get; set; } = string.Empty;
    public MachineryType Type { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public MachineryStatus Status { get; set; }
    public FuelType FuelType { get; set; }
    public decimal? FuelConsumptionPerHour { get; set; }
}
