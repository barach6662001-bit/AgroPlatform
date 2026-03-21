# Таск 003: UX: add machinery selection when creating operation

## Файл: `frontend/src/pages/Operations/OperationsList.tsx`

Додати imports якщо немає:
```typescript
import { getWarehouseItems } from '../../api/warehouses';
import { getMachines } from '../../api/machinery';
```

Додати стейт:
```typescript
const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
```

Додати useEffect для завантаження machines і warehouseItems якщо ще немає.

В модалку створення операції — після останнього Form.Item додати:
```tsx
<Form.Item label={t.operations.addMachinery || 'Техніка (опціонально)'}>
  <Select
    mode="multiple"
    allowClear
    placeholder={t.operations.selectMachinery || 'Оберіть техніку'}
    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
    options={machines.map(m => ({ value: m.id, label: `${m.name} (${m.inventoryNumber})` }))}
    onChange={setSelectedMachineIds}
  />
</Form.Item>
```

Після створення операції — додати техніку через API:
```typescript
for (const machineId of selectedMachineIds) {
  try { await addMachinery(result.id, { machineId, plannedHours: 0 }); } catch {}
}
setSelectedMachineIds([]);
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: add machinery selection when creating operation"
git push origin main
```
