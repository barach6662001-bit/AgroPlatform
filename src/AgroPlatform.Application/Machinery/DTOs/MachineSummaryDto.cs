namespace AgroPlatform.Application.Machinery.DTOs;

public class MachineSummaryDto
{
    public int TotalMachines { get; set; }
    public int ActiveCount { get; set; }
    public int UnderRepairCount { get; set; }
    public decimal TotalHoursAllMachines { get; set; }
    public decimal TotalFuelAllMachines { get; set; }
}
