using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetBudgetPlanVsFact;

public record GetBudgetPlanVsFactQuery(int Year) : IRequest<BudgetPlanVsFactDto>;

public record BudgetCategoryRowDto(
    string Category,
    decimal Planned,
    decimal Actual,
    decimal Variance,
    decimal ExecutionPercent);

public record BudgetPlanVsFactDto(
    decimal TotalPlanned,
    decimal TotalActual,
    decimal TotalVariance,
    decimal OverallExecutionPercent,
    List<BudgetCategoryRowDto> Rows);
