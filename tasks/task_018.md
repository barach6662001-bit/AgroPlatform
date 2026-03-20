# Таск 018: UX: confirmation dialogs before delete

На КОЖНІЙ кнопці видалення перевірити що є Popconfirm. Якщо ні — додати:

```tsx
<Popconfirm
  title="Видалити запис?"
  description="Цю дію неможливо скасувати"
  onConfirm={() => handleDelete(record.id)}
  okText="Видалити"
  cancelText="Скасувати"
  okButtonProps={{ danger: true }}
>
  <Button size="small" danger icon={<DeleteOutlined />} />
</Popconfirm>
```

Файли для перевірки: FieldsList, MachineryList, EmployeeList, OperationDetail, FieldFertilizerTab, FieldProtectionTab, FieldSeedingTab.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: confirmation dialogs before delete"
git push origin main
```
