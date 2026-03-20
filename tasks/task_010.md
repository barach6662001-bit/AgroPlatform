# Таск 010: UX: field name in stock movements table

## Frontend: `frontend/src/pages/Warehouses/StockMovements.tsx`

Додати колонку:
```tsx
{ title: 'Поле', dataIndex: 'fieldName', key: 'fieldName', render: (v: string) => v || '—' },
```

## Backend: `src/AgroPlatform.Application/Warehouses/Queries/GetMoveHistory/MoveHistoryDto.cs`

Додати: `public string? FieldName { get; set; }`

Handler — додати маппінг FieldName через join.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: field name in stock movements table"
git push origin main
```
