using AgroPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services.BackgroundJobs;

/// <summary>
/// Daily NBU exchange rate sync. Runs once per day at 06:00 Europe/Kyiv
/// (per ROADMAP "Decisions locked / Currency").
/// </summary>
public sealed class NbuDailySyncJob : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<NbuDailySyncJob> _logger;

    // The Linux build image supplies IANA zone data. If the zone is missing
    // (e.g. minimal container), fall back to +02:00 fixed offset, which is
    // close enough for a once-a-day window and still schedules the job.
    private static readonly TimeZoneInfo KyivTz = ResolveKyiv();

    public NbuDailySyncJob(IServiceProvider services, ILogger<NbuDailySyncJob> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Small startup delay; lets migrations finish first.
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var nbu = scope.ServiceProvider.GetRequiredService<INbuCurrencyService>();
                await nbu.SyncDailyAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "NBU daily sync job iteration failed; will retry at next 06:00 Kyiv.");
            }

            var delay = TimeUntilNext06Kyiv(DateTime.UtcNow);
            await Task.Delay(delay, stoppingToken);
        }
    }

    internal static TimeSpan TimeUntilNext06Kyiv(DateTime nowUtc)
    {
        var nowKyiv = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, KyivTz);
        var todayAt6 = new DateTime(nowKyiv.Year, nowKyiv.Month, nowKyiv.Day, 6, 0, 0, DateTimeKind.Unspecified);
        var nextKyiv = nowKyiv < todayAt6 ? todayAt6 : todayAt6.AddDays(1);
        var nextUtc = TimeZoneInfo.ConvertTimeToUtc(nextKyiv, KyivTz);
        var diff = nextUtc - nowUtc;
        return diff < TimeSpan.FromSeconds(1) ? TimeSpan.FromMinutes(1) : diff;
    }

    private static TimeZoneInfo ResolveKyiv()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv"); }
        catch (TimeZoneNotFoundException) { }
        try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Kiev"); }
        catch (TimeZoneNotFoundException) { }
        return TimeZoneInfo.CreateCustomTimeZone("Kyiv-fixed", TimeSpan.FromHours(2), "Kyiv", "Kyiv");
    }
}
