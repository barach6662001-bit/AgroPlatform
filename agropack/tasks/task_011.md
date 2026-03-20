# Таск 011: UX: P&L comparison chart + actual vs estimated

## Файл: `frontend/src/pages/Economics/FieldPnl.tsx`

Додати recharts imports: `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';`

Перед таблицею додати графік:
```tsx
{pnlData.length > 0 && (
  <Card style={{ marginBottom: 16, background: 'var(--agro-bg-card)', border: '1px solid var(--agro-border)' }}>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={pnlData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--agro-border)" />
        <XAxis dataKey="fieldName" stroke="var(--agro-text-secondary)" />
        <YAxis stroke="var(--agro-text-secondary)" />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalCosts" fill="#f85149" name="Витрати" />
        <Bar dataKey="estimatedRevenue" fill="#3fb950" name="Дохід" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
)}
```

В колонці Дохід показати (фактичний) або (оціночний) підпис.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: P&L comparison chart + actual vs estimated"
git push origin main
```
