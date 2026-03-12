using MediatR;

namespace AgroPlatform.Application.Economics.Commands.UpsertBudget;

public record UpsertBudgetCommand(int Year, string Category, decimal PlannedAmount, string? Note)
    : IRequest<Guid>;
