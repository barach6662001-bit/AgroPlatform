# Таск 004: UX: grain storage KPI cards

## Файл: `frontend/src/pages/GrainStorage/GrainBatchList.tsx`

Перед таблицею партій додати KPI-картки:

```typescript
const batches = result?.items ?? [];
const totalTons = batches.reduce((s, b) => s + b.quantityTons, 0);
const totalValue = batches.reduce((s, b) => s + b.quantityTons * (b.pricePerTon || 0), 0);
const cultures = [...new Set(batches.map(b => b.grainType))];
```

```tsx
<Row gutter={12} style={{ marginBottom: 16 }}>
  <Col span={8}>
    <Card size="small" style={{ background: 'var(--agro-bg-card)', border: '1px solid var(--agro-border)' }}>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Загальний обсяг</Text>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{totalTons.toFixed(1)} т</div>
    </Card>
  </Col>
  <Col span={8}>
    <Card size="small" style={{ background: 'var(--agro-bg-card)', border: '1px solid var(--agro-border)' }}>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Загальна вартість</Text>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{totalValue.toLocaleString()} ₴</div>
    </Card>
  </Col>
  <Col span={8}>
    <Card size="small" style={{ background: 'var(--agro-bg-card)', border: '1px solid var(--agro-border)' }}>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>Культур</Text>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{cultures.length}</div>
    </Card>
  </Col>
</Row>
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: grain storage KPI cards"
git push origin main
```
