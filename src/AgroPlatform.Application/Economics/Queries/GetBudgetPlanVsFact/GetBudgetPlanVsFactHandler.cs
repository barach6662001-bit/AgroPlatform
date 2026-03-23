using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetBudgetPlanVsFact;

public class GetBudgetPlanVsFactHandler : IRequestHandler<GetBudgetPlanVsFactQuery, BudgetPlanVsFactDto>
{
    private readonly IAppDbContext _context;

    public GetBudgetPlanVsFactHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetPlanVsFactDto> Handle(GetBudgetPlanVsFactQuery request, CancellationToken cancellationToken)
    {
        var yearStart = new DateTime(request.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd = new DateTime(request.Year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var budgets = await _context.Budgets
            .Where(b => b.Year == request.Year && !b.IsDeleted)
            .Select(b => new { b.Category, b.PlannedAmount })
            .ToListAsync(cancellationToken);

        var actuals = await _context.CostRecords
            .Where(c => !c.IsDeleted && c.Date >= yearStart && c.Date <= yearEnd)
            .GroupBy(c => c.Category)
            .Select(g => new { Category = g.Key, Actual = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        // Build union of all categories from both budgets and actuals
        var allCategories = budgets.Select(b => b.Category)
            .Union(actuals.Select(a => a.Category))
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        var rows = allCategories.Select(cat =>
        {
            var planned = budgets.FirstOrDefault(b => b.Category == cat)?.PlannedAmount ?? 0m;
            var actual = actuals.FirstOrDefault(a => a.Category == cat)?.Actual ?? 0m;
            var variance = planned - actual;
            var executionPct = planned > 0 ? Math.Round(actual / planned * 100, 1) : 0m;
            return new BudgetCategoryRowDto(cat, planned, actual, variance, executionPct);
        }).ToList();

        var totalPlanned = rows.Sum(r => r.Planned);
        var totalActual = rows.Sum(r => r.Actual);
        var totalVariance = totalPlanned - totalActual;
        var overallExecution = totalPlanned > 0 ? Math.Round(totalActual / totalPlanned * 100, 1) : 0m;

        return new BudgetPlanVsFactDto(totalPlanned, totalActual, totalVariance, overallExecution, rows);
    }
}
