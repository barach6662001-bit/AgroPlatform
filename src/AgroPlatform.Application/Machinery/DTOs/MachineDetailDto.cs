namespace AgroPlatform.Application.Machinery.DTOs;

public class MachineDetailDto : MachineDto
{
    public List<WorkLogDto> RecentWorkLogs { get; set; } = new();
    public List<FuelLogDto> RecentFuelLogs { get; set; } = new();
    public decimal TotalHoursWorked { get; set; }
    public decimal TotalFuelConsumed { get; set; }
}
