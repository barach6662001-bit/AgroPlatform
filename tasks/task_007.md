# Таск 007: UX: lease payment progress bar

## Файл: `frontend/src/pages/Fields/LeasePage.tsx`

Додати `import { Progress } from 'antd';`

Додати/замінити колонку оплати:
```tsx
{
  title: t.lease.paymentProgress || 'Оплата',
  key: 'progress',
  width: 200,
  render: (_: unknown, record: LeaseSummaryDto) => {
    const paid = record.totalPaid || 0;
    const total = record.annualPayment || 0;
    const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
    return (
      <div>
        <Progress percent={pct} size="small" strokeColor={pct >= 100 ? '#3fb950' : pct > 0 ? '#f0883e' : '#f85149'} showInfo={false} />
        <Text type="secondary" style={{ fontSize: 11 }}>{paid.toLocaleString()} / {total.toLocaleString()} ₴</Text>
      </div>
    );
  },
},
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: lease payment progress bar"
git push origin main
```
