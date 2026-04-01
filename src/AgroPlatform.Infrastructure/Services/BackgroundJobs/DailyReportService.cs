using AgroPlatform.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Background job that sends a daily stock balance summary email to tenant admins at 06:00 UTC.
/// </summary>
public class DailyReportService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyReportService> _logger;

    public DailyReportService(IServiceProvider serviceProvider, ILogger<DailyReportService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddHours(6);
            if (now >= nextRun)
                nextRun = nextRun.AddDays(1);

            var delay = nextRun - now;
            _logger.LogInformation("DailyReportService: next run at {NextRun} (in {Delay})", nextRun, delay);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            try
            {
                await SendDailyReports(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DailyReportService");
            }
        }
    }

    private async Task SendDailyReports(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var tenants = await db.Tenants
            .Select(t => t.Id)
            .ToListAsync(ct);

        foreach (var tenantId in tenants)
        {
            try
            {
                await SendTenantReport(db, emailService, tenantId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send daily report for tenant {TenantId}", tenantId);
            }
        }
    }

    private async Task SendTenantReport(
        Persistence.AppDbContext db,
        IEmailService emailService,
        Guid tenantId,
        CancellationToken ct)
    {
        var balances = await db.StockBalances
            .Where(b => b.TenantId == tenantId && !b.IsDeleted && b.BalanceBase > 0)
            .Include(b => b.Item)
            .Include(b => b.Warehouse)
            .OrderBy(b => b.Warehouse!.Name)
            .ThenBy(b => b.Item!.Name)
            .ToListAsync(ct);

        if (balances.Count == 0) return;

        var adminEmails = await db.Users
            .Where(u => u.TenantId == tenantId)
            .Join(db.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u.Email, ur.RoleId })
            .Join(db.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.Email, r.Name })
            .Where(x => x.Name == "Admin" || x.Name == "Director" || x.Name == "CompanyAdmin")
            .Select(x => x.Email)
            .Distinct()
            .ToListAsync(ct);

        if (adminEmails.Count == 0) return;

        var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var subject = $"[AgroPlatform] Щоденна зведення залишків — {date}";

        var rows = string.Join("", balances.Select(b =>
            $"<tr><td style='padding:6px 12px;border:1px solid #ddd'>{b.Warehouse?.Name}</td>" +
            $"<td style='padding:6px 12px;border:1px solid #ddd'>{b.Item?.Name}</td>" +
            $"<td style='padding:6px 12px;border:1px solid #ddd'>{b.Item?.Code}</td>" +
            $"<td style='padding:6px 12px;border:1px solid #ddd;text-align:right'>{b.BalanceBase:F2} {b.BaseUnit}</td></tr>"));

        var lowStockWarnings = balances
            .Where(b => b.Item?.MinimumQuantity != null && b.BalanceBase <= b.Item.MinimumQuantity)
            .ToList();

        var warningSection = lowStockWarnings.Count > 0
            ? $"<h3 style='color:#d32f2f'>⚠ Низький запас ({lowStockWarnings.Count})</h3><ul>" +
              string.Join("", lowStockWarnings.Select(b =>
                  $"<li><strong>{b.Item?.Name}</strong> — {b.BalanceBase:F1} {b.BaseUnit} (мін: {b.Item?.MinimumQuantity:F1})</li>")) +
              "</ul>"
            : "";

        var html = $@"
<html><body style='font-family:Arial,sans-serif;color:#333'>
<h2>Щоденна зведення залишків — {date}</h2>
{warningSection}
<table style='border-collapse:collapse;width:100%'>
<thead><tr style='background:#f5f5f5'>
<th style='padding:8px 12px;border:1px solid #ddd;text-align:left'>Склад</th>
<th style='padding:8px 12px;border:1px solid #ddd;text-align:left'>Товар</th>
<th style='padding:8px 12px;border:1px solid #ddd;text-align:left'>Код</th>
<th style='padding:8px 12px;border:1px solid #ddd;text-align:right'>Залишок</th>
</tr></thead>
<tbody>{rows}</tbody>
</table>
<p style='margin-top:16px;color:#888;font-size:12px'>Цей звіт згенеровано автоматично системою AgroPlatform.</p>
</body></html>";

        foreach (var email in adminEmails.Where(e => !string.IsNullOrWhiteSpace(e)))
        {
            await emailService.SendAsync(email!, subject, html, ct);
        }

        _logger.LogInformation("Daily stock report sent for tenant {TenantId} to {Count} recipients ({BalanceCount} items)",
            tenantId, adminEmails.Count, balances.Count);
    }
}
