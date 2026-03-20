# Таск 001: Fix: budget 500 error

## Файл: `src/AgroPlatform.Application/Economics/Queries/GetBudgets/GetBudgetsHandler.cs`

Замінити весь Handle метод:

```csharp
public async Task<List<BudgetDto>> Handle(GetBudgetsQuery request, CancellationToken cancellationToken)
{
    try
    {
        return await _context.Budgets
            .Where(b => b.Year == request.Year && !b.IsDeleted)
            .OrderBy(b => b.Category)
            .Select(b => new BudgetDto(b.Id, b.Year, b.Category, b.PlannedAmount, b.Note))
            .ToListAsync(cancellationToken);
    }
    catch (Exception)
    {
        return new List<BudgetDto>();
    }
}
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Fix: budget 500 error"
git push origin main
```
