namespace AgroPlatform.Application.Analytics.DTOs;

public class FuelAnalyticsDto
{
    public List<FuelConsumptionPerMachineDto> PerMachine { get; set; } = new();
    public List<MonthlyFuelTrendDto> MonthlyTrend { get; set; } = new();
}
