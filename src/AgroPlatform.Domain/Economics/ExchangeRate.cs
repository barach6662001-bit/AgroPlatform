namespace AgroPlatform.Domain.Economics;

/// <summary>
/// NBU-published daily exchange rate of a foreign currency against UAH.
/// Base currency in the system is UAH; this table stores historical rates for
/// presentation-layer conversion only (per PR #613 / ROADMAP locked decisions).
/// Composite primary key: (Code, Date).
/// </summary>
public class ExchangeRate
{
    /// <summary>ISO 4217 currency code, e.g. "USD", "EUR".</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Date the NBU rate applies to (Kyiv local date).</summary>
    public DateOnly Date { get; set; }

    /// <summary>How many UAH per 1 unit of <see cref="Code"/>.</summary>
    public decimal RateToUah { get; set; }

    /// <summary>Timestamp when the row was fetched/written. Diagnostics only.</summary>
    public DateTime FetchedAtUtc { get; set; } = DateTime.UtcNow;
}
