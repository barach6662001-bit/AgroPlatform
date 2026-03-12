using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetBudgets;

public class GetBudgetsHandler : IRequestHandler<GetBudgetsQuery, List<BudgetDto>>
{
    private readonly IAppDbContext _context;

    public GetBudgetsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetDto>> Handle(GetBudgetsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Budgets
            .Where(b => b.Year == request.Year)
            .OrderBy(b => b.Category)
            .Select(b => new BudgetDto(b.Id, b.Year, b.Category, b.PlannedAmount, b.Note))
            .ToListAsync(cancellationToken);
    }
}
