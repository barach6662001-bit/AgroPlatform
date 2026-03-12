using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetBudgets;

public record GetBudgetsQuery(int Year) : IRequest<List<BudgetDto>>;

public record BudgetDto(Guid Id, int Year, string Category, decimal PlannedAmount, string? Note);
