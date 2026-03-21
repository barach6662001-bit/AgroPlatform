# Таск 009: UX: maintenance countdown on machinery

## Файл: `frontend/src/pages/Machinery/MachineryList.tsx`

Додати колонку:
```tsx
{
  title: t.machinery.nextMaintenance || 'Наступне ТО',
  dataIndex: 'nextMaintenanceDate',
  render: (date: string | null) => {
    if (!date) return <Text type="secondary">—</Text>;
    const days = dayjs(date).diff(dayjs(), 'day');
    if (days < 0) return <Tag color="red">Прострочено {Math.abs(days)} дн.</Tag>;
    if (days <= 7) return <Tag color="orange">Через {days} дн.</Tag>;
    return <Text type="secondary">{dayjs(date).format('DD.MM.YYYY')}</Text>;
  },
},
```

## Файл: `frontend/src/pages/Machinery/MachineDetail.tsx`

Додати KPI-картку "Наступне ТО" поряд з напрацюванням і пальним.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: maintenance countdown on machinery"
git push origin main
```
