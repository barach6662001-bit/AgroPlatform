using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Background job that checks fuel consumption logs for anomalies.
/// If deviation from the norm exceeds 20%, creates an alert notification.
/// Runs every 6 hours.
/// </summary>
public class FuelAnomalyJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FuelAnomalyJob> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    public FuelAnomalyJob(IServiceProvider serviceProvider, ILogger<FuelAnomalyJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckFuelAnomalies(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in FuelAnomalyJob");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task CheckFuelAnomalies(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var tenants = await db.Tenants
            .Select(t => t.Id)
            .ToListAsync(ct);

        foreach (var tenantId in tenants)
        {
            // Get fuel logs from the last 24 hours for this tenant
            var cutoff = DateTime.UtcNow.AddHours(-24);

            var recentLogs = await db.FuelLogs
                .Where(f => f.TenantId == tenantId && f.Date >= cutoff && !f.IsDeleted)
                .Include(f => f.Machine)
                .ToListAsync(ct);

            if (recentLogs.Count == 0) continue;

            // Get norms for this tenant
            var norms = await db.FuelNorms
                .Where(n => n.TenantId == tenantId && !n.IsDeleted)
                .ToListAsync(ct);

            foreach (var log in recentLogs)
            {
                var machineType = log.Machine?.Type ?? default;

                // Find matching norm (any operation type for this machine type)
                var norm = norms.FirstOrDefault(n => n.MachineType == machineType);
                if (norm == null || norm.NormLitersPerHour == null) continue;

                // Calculate last 30 days average for this machine
                var avgStartDate = DateTime.UtcNow.AddDays(-30);
                var avgConsumption = await db.FuelLogs
                    .Where(f => f.TenantId == tenantId && f.MachineId == log.MachineId
                           && f.Date >= avgStartDate && !f.IsDeleted)
                    .AverageAsync(f => (decimal?)f.Quantity, ct) ?? 0;

                if (avgConsumption == 0) continue;

                var deviation = Math.Abs((log.Quantity - avgConsumption) / avgConsumption);

                if (deviation > 0.20m)
                {
                    var machineName = log.Machine?.Name ?? log.MachineId.ToString();
                    await notifications.SendAsync(
                        tenantId,
                        "warning",
                        $"Аномальна витрата пального: {machineName}",
                        $"Витрата {log.Quantity:F1} л відхиляється на {deviation:P0} від середнього ({avgConsumption:F1} л). Перевірте техніку.",
                        ct);

                    _logger.LogWarning("Fuel anomaly detected for machine {MachineId} in tenant {TenantId}: {Quantity}L (avg: {Avg}L, deviation: {Dev:P0})",
                        log.MachineId, tenantId, log.Quantity, avgConsumption, deviation);
                }
            }
        }
    }
}
