using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Background job that forecasts low stock based on 30-day average consumption.
/// Creates alert notifications when projected stock will run out within 7 days.
/// Runs every 4 hours.
/// </summary>
public class LowStockAlertJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LowStockAlertJob> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(4);

    public LowStockAlertJob(IServiceProvider serviceProvider, ILogger<LowStockAlertJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Small initial delay to let the app start
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckLowStock(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LowStockAlertJob");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task CheckLowStock(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var tenants = await db.Tenants
            .Select(t => t.Id)
            .ToListAsync(ct);

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        foreach (var tenantId in tenants)
        {
            // Get all current balances for this tenant
            var balances = await db.StockBalances
                .Where(b => b.TenantId == tenantId && !b.IsDeleted && b.BalanceBase > 0)
                .Include(b => b.Item)
                .Include(b => b.Warehouse)
                .ToListAsync(ct);

            foreach (var balance in balances)
            {
                // Calculate average daily consumption (Issue + WriteOff moves) over last 30 days
                var totalConsumed = await db.StockMoves
                    .Where(m => m.TenantId == tenantId
                        && m.ItemId == balance.ItemId
                        && m.WarehouseId == balance.WarehouseId
                        && m.CreatedAtUtc >= thirtyDaysAgo
                        && !m.IsDeleted
                        && (m.MoveType == StockMoveType.Issue || m.MoveType == StockMoveType.InventoryMinus))
                    .SumAsync(m => m.QuantityBase, ct);

                if (totalConsumed == 0) continue;

                var dailyAvg = totalConsumed / 30m;
                var daysRemaining = balance.BalanceBase / dailyAvg;

                // Also check if below MinimumQuantity
                var belowMinimum = balance.Item?.MinimumQuantity != null
                    && balance.BalanceBase <= balance.Item.MinimumQuantity;

                if (daysRemaining <= 7 || belowMinimum)
                {
                    var itemName = balance.Item?.Name ?? "Unknown";
                    var warehouseName = balance.Warehouse?.Name ?? "Unknown";

                    var title = belowMinimum
                        ? $"Низький запас: {itemName}"
                        : $"Прогноз вичерпання: {itemName}";

                    var body = belowMinimum
                        ? $"Залишок {balance.BalanceBase:F1} {balance.BaseUnit} на складі «{warehouseName}» нижче мінімуму ({balance.Item!.MinimumQuantity:F1})."
                        : $"Залишок {balance.BalanceBase:F1} {balance.BaseUnit} на складі «{warehouseName}» вичерпається приблизно за {daysRemaining:F0} днів (середня витрата {dailyAvg:F1}/день).";

                    await notifications.SendAsync(tenantId, "warning", title, body, ct);

                    _logger.LogWarning("Low stock alert for item {ItemId} in warehouse {WarehouseId}, tenant {TenantId}: {Balance} {Unit}, ~{Days:F0} days remaining",
                        balance.ItemId, balance.WarehouseId, tenantId, balance.BalanceBase, balance.BaseUnit, daysRemaining);
                }
            }
        }
    }
}
