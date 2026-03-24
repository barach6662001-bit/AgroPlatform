namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Unified high-level economics summary (revenue, costs, margin).</summary>
public record EconomicsSummaryDto(
    decimal TotalRevenue,
    decimal TotalCosts,
    decimal Margin,
    decimal? MarginPercent = null
);
