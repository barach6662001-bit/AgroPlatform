# Таск 002: UX: year filter labels on field tabs

## Файли:
- `frontend/src/pages/Fields/FieldSeedingTab.tsx`
- `frontend/src/pages/Fields/FieldFertilizerTab.tsx`
- `frontend/src/pages/Fields/FieldProtectionTab.tsx`

В кожному файлі знайти блок де рендериться Select року і кнопка "Додати". Додати лейбл "Рік:" перед Select:

```tsx
<Space style={{ marginBottom: 12 }}>
  <Text type="secondary" style={{ fontSize: 13 }}>{t.common.year || 'Рік'}:</Text>
  <Select
    style={{ width: 90 }}
    value={year}
    onChange={setYear}
    options={yearOptions}
    allowClear
    placeholder={t.common.all || 'Всі'}
  />
  {canWrite && (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
      {/* keep existing label */}
    </Button>
  )}
</Space>
```

Додати `import { Typography } from 'antd';` і `const { Text } = Typography;` якщо немає.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: year filter labels on field tabs"
git push origin main
```
