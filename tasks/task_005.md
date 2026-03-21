# Таск 005: Feature: buyer name in grain issue

## Backend

**Файл:** `src/AgroPlatform.Domain/GrainStorage/GrainMovement.cs` — додати: `public string? BuyerName { get; set; }`

**Файл:** `src/AgroPlatform.Application/GrainStorage/Commands/CreateGrainMovement/CreateGrainMovementCommand.cs` — додати параметр `string? BuyerName = null`

**Файл:** Handler — при створенні movement додати: `BuyerName = request.BuyerName,`

Створити міграцію:
```bash
dotnet ef migrations add AddBuyerNameToGrainMovement --project src/AgroPlatform.Infrastructure --startup-project src/AgroPlatform.Api --output-dir Persistence/Migrations
```

## Frontend

**Файл:** `frontend/src/pages/GrainStorage/GrainBatchList.tsx`

В модалці видачі зерна додати:
```tsx
<Form.Item name="buyerName" label={t.grain.buyer || 'Покупець'}>
  <Input placeholder="Назва покупця або отримувача" />
</Form.Item>
```

В handleIssueGrain додати `buyerName: values.buyerName`.

i18n uk.ts grain: `buyer: 'Покупець'`
en.ts: `buyer: 'Buyer'`

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: buyer name in grain issue"
git push origin main
```
