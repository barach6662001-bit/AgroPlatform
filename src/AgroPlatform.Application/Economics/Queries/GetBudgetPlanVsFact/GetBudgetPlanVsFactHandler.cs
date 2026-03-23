using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetBudgetPlanVsFact;

public class GetBudgetPlanVsFactHandler : IRequestHandler<GetBudgetPlanVsFactQuery, List<BudgetPlanVsFactDto>>
{
    private readonly IAppDbContext _context;

    public GetBudgetPlanVsFactHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetPlanVsFactDto>> Handle(GetBudgetPlanVsFactQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _context.Budgets
            .Where(b => b.Year == request.Year && !b.IsDeleted)
            .Select(b => new { b.Category, b.PlannedAmount })
            .ToListAsync(cancellationToken);

        var actuals = await _context.CostRecords
            .Where(c => c.Date.Year == request.Year && !c.IsDeleted && c.Amount >= 0)
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, FactAmount = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var categories = budgets.Select(b => b.Category)
            .Union(actuals.Select(a => a.Category))
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        return categories.Select(cat =>
        {
            var planned = budgets.FirstOrDefault(b => b.Category == cat)?.PlannedAmount ?? 0m;
            var fact = actuals.FirstOrDefault(a => a.Category == cat)?.FactAmount ?? 0m;
            var variance = planned - fact;
            var executionPercent = planned > 0 ? Math.Round(fact / planned * 100, 1) : 0m;
            return new BudgetPlanVsFactDto(cat, planned, fact, variance, executionPercent);
        }).ToList();
    }
}
