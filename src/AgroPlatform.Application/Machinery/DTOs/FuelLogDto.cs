using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Machinery.DTOs;

public class FuelLogDto
{
    public Guid Id { get; set; }
    public Guid MachineId { get; set; }
    public DateTime Date { get; set; }
    public decimal Quantity { get; set; }
    public FuelType FuelType { get; set; }
    public string? Note { get; set; }
}
