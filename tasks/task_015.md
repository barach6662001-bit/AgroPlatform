# Таск 015: UX: soil type select dropdown

## Файл: `frontend/src/pages/Fields/FieldsList.tsx`

Замінити Input для soilType на Select:
```tsx
<Form.Item name="soilType" label={t.fields.soilType}>
  <Select allowClear placeholder="Оберіть тип ґрунту">
    <Option value="Чорнозем">Чорнозем</Option>
    <Option value="Суглинок">Суглинок</Option>
    <Option value="Супісок">Супісок</Option>
    <Option value="Пісок">Пісок</Option>
    <Option value="Глина">Глина</Option>
    <Option value="Торф">Торф</Option>
  </Select>
</Form.Item>
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: soil type select dropdown"
git push origin main
```
