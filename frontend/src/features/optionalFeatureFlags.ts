export const OptionalFeatureFlags = {
  budget: 'budget',
  pnlByFields: 'pnl_by_fields',
  analyticsMarginality: 'analytics.marginality',
  analyticsSeasonComparison: 'analytics.season_comparison',
  analyticsBreakEven: 'analytics.break_even',
  analyticsFieldEfficiency: 'analytics.field_efficiency',
  analyticsResourceUsage: 'analytics.resource_usage',
  analyticsExpenseAnalytics: 'analytics.expense_analytics',
  analyticsSalesAnalytics: 'analytics.sales_analytics',
} as const;

export type OptionalFeatureFlagKey = (typeof OptionalFeatureFlags)[keyof typeof OptionalFeatureFlags];

export const allOptionalFeatureFlagKeys: OptionalFeatureFlagKey[] = Object.values(OptionalFeatureFlags);