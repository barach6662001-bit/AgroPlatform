# Таск 013: Sync: maintenance cost auto CostRecord

## Файл: `src/AgroPlatform.Application/Machinery/Commands/AddMaintenance/AddMaintenanceHandler.cs`

Додати `using AgroPlatform.Domain.Economics;`

Після створення MaintenanceRecord, перед SaveChanges:
```csharp
if (request.Cost.HasValue && request.Cost.Value > 0)
{
    var machine = await _context.Machines.FindAsync(new object[] { request.MachineId }, cancellationToken);
    _context.CostRecords.Add(new CostRecord
    {
        Category = "Equipment",
        Amount = request.Cost.Value,
        Currency = "UAH",
        Date = request.Date,
        Description = $"ТО: {machine?.Name ?? "Техніка"} — {request.Type}"
    });
}
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Sync: maintenance cost auto CostRecord"
git push origin main
```
