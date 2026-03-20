# Таск 008: Sync: lease payment notification when fully paid

## Файл: `src/AgroPlatform.Application/Fields/Commands/AddLeasePayment/AddLeasePaymentHandler.cs`

Додати в конструктор INotificationService та ICurrentUserService (якщо ще немає).

Після SaveChanges, перед return додати:
```csharp
if (lease != null)
{
    var totalPaidThisYear = await _context.LeasePayments
        .Where(p => p.LandLeaseId == request.LandLeaseId && p.Year == request.Year && !p.IsDeleted)
        .SumAsync(p => p.Amount, cancellationToken);

    if (totalPaidThisYear >= lease.AnnualPayment)
    {
        var field = await _context.Fields.FindAsync(new object[] { lease.FieldId }, cancellationToken);
        await _notifications.SendAsync(
            _currentUser.TenantId, "success", "Оренду повністю сплачено",
            $"Договір поля '{field?.Name ?? ""}' за {request.Year} рік — сплачено ({totalPaidThisYear:N0} ₴)",
            cancellationToken);
    }
}
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Sync: lease payment notification when fully paid"
git push origin main
```
