using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetBudgetPlanVsFact;

public record GetBudgetPlanVsFactQuery(int Year) : IRequest<List<BudgetPlanVsFactDto>>;

public record BudgetPlanVsFactDto(
    string Category,
    decimal PlannedAmount,
    decimal FactAmount,
    decimal Variance,
    decimal ExecutionPercent
);
