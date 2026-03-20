# Таск 006: UX: expandable lease payment history

## Файл: `frontend/src/pages/Fields/LeasePage.tsx`

Додати expandable в таблицю договорів:

```tsx
expandable={{
  expandedRowRender: (record) => {
    const lease = leases.find(l => l.id === record.leaseId || l.fieldId === record.fieldId);
    const payments = lease?.payments || [];
    if (!payments.length) return <Text type="secondary">Виплат ще не було</Text>;
    return (
      <Table
        size="small"
        dataSource={payments}
        columns={[
          { title: 'Дата', dataIndex: 'paymentDate', render: (d: string) => dayjs(d).format('DD.MM.YYYY') },
          { title: 'Сума', dataIndex: 'amount', render: (v: number) => `${v.toLocaleString()} ₴` },
          { title: 'Спосіб', dataIndex: 'paymentMethod', render: (v: string) => v === 'Grain' ? 'Зерном' : 'Грошима' },
          { title: 'Примітка', dataIndex: 'notes', render: (v: string) => v || '—' },
        ]}
        rowKey="id"
        pagination={false}
      />
    );
  },
}}
```

Backend: перевірити що GetLeases повертає payments. Якщо ні — додати `.Include(l => l.Payments)` в handler і `Payments` в DTO.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: expandable lease payment history"
git push origin main
```
