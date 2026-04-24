using System.Text.Json;
using System.Text.Json.Serialization;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services;

/// <summary>
/// NBU currency rate integration per ROADMAP "Decisions locked / Currency":
/// endpoint <c>https://bank.gov.ua/NBU_Exchange/exchange_site?start=YYYYMMDD&amp;end=YYYYMMDD&amp;valcode=USD&amp;json</c>.
/// </summary>
public sealed class NbuCurrencyService : INbuCurrencyService
{
    /// <summary>Currencies we track for display conversion.</summary>
    public static readonly string[] SupportedCodes = { "USD", "EUR" };

    private readonly HttpClient _http;
    private readonly IServiceProvider _services;
    private readonly ILogger<NbuCurrencyService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public NbuCurrencyService(HttpClient http, IServiceProvider services, ILogger<NbuCurrencyService> logger)
    {
        _http = http;
        _services = services;
        _logger = logger;
    }

    public async Task<decimal?> GetRateAsync(string code, DateOnly date, CancellationToken ct = default)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        return await db.ExchangeRates
            .Where(r => r.Code == code && r.Date <= date)
            .OrderByDescending(r => r.Date)
            .Select(r => (decimal?)r.RateToUah)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<decimal?> GetLatestRateAsync(string code, CancellationToken ct = default)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        return await db.ExchangeRates
            .Where(r => r.Code == code)
            .OrderByDescending(r => r.Date)
            .Select(r => (decimal?)r.RateToUah)
            .FirstOrDefaultAsync(ct);
    }

    public async Task SyncDailyAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        foreach (var code in SupportedCodes)
        {
            try
            {
                await BackfillAsync(code, today, today, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "NBU daily sync failed for {Code}; last stored rate will be used.", code);
            }
        }
    }

    public async Task<int> BackfillAsync(string code, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("code required", nameof(code));
        if (to < from) throw new ArgumentException("to must be >= from");

        var url = $"https://bank.gov.ua/NBU_Exchange/exchange_site?start={from:yyyyMMdd}&end={to:yyyyMMdd}&valcode={code}&sort=exchangedate&order=desc&json";
        using var response = await _http.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        var rows = await JsonSerializer.DeserializeAsync<List<NbuRow>>(stream, JsonOpts, ct)
                   ?? new List<NbuRow>();

        if (rows.Count == 0) return 0;

        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();

        var parsed = new List<ExchangeRate>();
        foreach (var row in rows)
        {
            if (string.IsNullOrWhiteSpace(row.Cc) || row.Rate <= 0) continue;
            if (!DateOnly.TryParseExact(row.ExchangeDate, "dd.MM.yyyy", out var date)) continue;
            parsed.Add(new ExchangeRate
            {
                Code = row.Cc.ToUpperInvariant(),
                Date = date,
                RateToUah = row.Rate,
                FetchedAtUtc = DateTime.UtcNow,
            });
        }

        if (parsed.Count == 0) return 0;

        // Upsert: load existing rows in window, update amounts; insert new ones.
        var codes = parsed.Select(p => p.Code).Distinct().ToList();
        var dates = parsed.Select(p => p.Date).Distinct().ToList();
        var existing = await db.ExchangeRates
            .Where(r => codes.Contains(r.Code) && dates.Contains(r.Date))
            .ToListAsync(ct);

        var existingMap = existing.ToDictionary(e => (e.Code, e.Date));
        foreach (var p in parsed)
        {
            if (existingMap.TryGetValue((p.Code, p.Date), out var row))
            {
                row.RateToUah = p.RateToUah;
                row.FetchedAtUtc = p.FetchedAtUtc;
            }
            else
            {
                db.ExchangeRates.Add(p);
            }
        }

        await db.SaveChangesAsync(ct);
        return parsed.Count;
    }

    private sealed class NbuRow
    {
        [JsonPropertyName("exchangedate")] public string ExchangeDate { get; set; } = string.Empty;
        [JsonPropertyName("cc")] public string Cc { get; set; } = string.Empty;
        [JsonPropertyName("rate")] public decimal Rate { get; set; }
    }
}
