namespace AgroPlatform.Application.Analytics.DTOs;

public class DashboardDto
{
    // Fields summary
    public int TotalFields { get; set; }
    public decimal TotalAreaHectares { get; set; }
    public Dictionary<string, decimal> AreaByCrop { get; set; } = new();

    // Warehouse summary
    public int TotalWarehouses { get; set; }
    public int TotalWarehouseItems { get; set; }
    public List<TopStockItemDto> TopStockItems { get; set; } = new();

    // Operations summary
    public int TotalOperations { get; set; }
    public int CompletedOperations { get; set; }
    public int PendingOperations { get; set; }
    public Dictionary<string, int> OperationsByType { get; set; } = new();

    // Machinery summary
    public int TotalMachines { get; set; }
    public int ActiveMachines { get; set; }
    public int UnderRepairMachines { get; set; }
    public decimal TotalHoursWorked { get; set; }
    public decimal TotalFuelConsumed { get; set; }

    // Economics summary
    public decimal TotalCosts { get; set; }
    public Dictionary<string, decimal> CostsByCategory { get; set; } = new();
    public List<MonthlyCostTrendDto> CostTrend { get; set; } = new();
}
