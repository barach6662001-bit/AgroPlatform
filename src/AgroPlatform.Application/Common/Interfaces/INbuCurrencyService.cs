namespace AgroPlatform.Application.Common.Interfaces;

/// <summary>
/// Integrates with the National Bank of Ukraine exchange rates endpoint.
/// Rates are stored in <c>ExchangeRates</c> with UAH as the base.
/// See ROADMAP.md "Decisions locked / Currency" for scope and fallback rules.
/// </summary>
public interface INbuCurrencyService
{
    /// <summary>
    /// Returns the rate (UAH per 1 unit of <paramref name="code"/>) for <paramref name="date"/>.
    /// When the exact date is not present (weekend/holiday), returns the most recent
    /// earlier stored rate. Returns <c>null</c> when no rate for the currency exists at all.
    /// </summary>
    Task<decimal?> GetRateAsync(string code, DateOnly date, CancellationToken ct = default);

    /// <summary>
    /// Returns the latest stored rate for <paramref name="code"/>, or <c>null</c>.
    /// </summary>
    Task<decimal?> GetLatestRateAsync(string code, CancellationToken ct = default);

    /// <summary>
    /// Fetches today's rate(s) from NBU for every supported currency and upserts them.
    /// Safe to call multiple times per day; idempotent.
    /// On NBU failure, logs a warning and leaves existing rows untouched.
    /// </summary>
    Task SyncDailyAsync(CancellationToken ct = default);

    /// <summary>
    /// Fetches the rate range [<paramref name="from"/>, <paramref name="to"/>] for a single
    /// currency and upserts rows. Used by the backfill tool and tests.
    /// </summary>
    Task<int> BackfillAsync(string code, DateOnly from, DateOnly to, CancellationToken ct = default);
}
