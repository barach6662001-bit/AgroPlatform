using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Commands.UpsertBudget;

public class UpsertBudgetHandler : IRequestHandler<UpsertBudgetCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpsertBudgetHandler(IAppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UpsertBudgetCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Year == request.Year && b.Category == request.Category, cancellationToken);

        if (existing != null)
        {
            existing.PlannedAmount = request.PlannedAmount;
            existing.Note = request.Note;
            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var budget = new Budget
        {
            TenantId = _currentUser.TenantId,
            Year = request.Year,
            Category = request.Category,
            PlannedAmount = request.PlannedAmount,
            Note = request.Note,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync(cancellationToken);
        return budget.Id;
    }
}
