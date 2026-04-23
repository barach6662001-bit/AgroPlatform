namespace AgroPlatform.Domain.FeatureFlags;

public static class OptionalFeatureFlagKeys
{
    public const string Budget = "budget";
    public const string PnlByFields = "pnl_by_fields";
    public const string AnalyticsMarginality = "analytics.marginality";
    public const string AnalyticsSeasonComparison = "analytics.season_comparison";
    public const string AnalyticsBreakEven = "analytics.break_even";
    public const string AnalyticsFieldEfficiency = "analytics.field_efficiency";
    public const string AnalyticsResourceUsage = "analytics.resource_usage";
    public const string AnalyticsExpenseAnalytics = "analytics.expense_analytics";
    public const string AnalyticsSalesAnalytics = "analytics.sales_analytics";

    public static readonly string[] All =
    [
        Budget,
        PnlByFields,
        AnalyticsMarginality,
        AnalyticsSeasonComparison,
        AnalyticsBreakEven,
        AnalyticsFieldEfficiency,
        AnalyticsResourceUsage,
        AnalyticsExpenseAnalytics,
        AnalyticsSalesAnalytics,
    ];
}