# Таск 012: UX: dashboard onboarding wizard with demo data

## Файл: `frontend/src/pages/Dashboard.tsx`

Перевірити що є ONBOARDING_THRESHOLD_FIELDS. Додати в JSX перед основним контентом:

```tsx
{fields.length < ONBOARDING_THRESHOLD && (
  <Card style={{ background: 'var(--agro-bg-card)', textAlign: 'center', padding: '40px 20px', marginBottom: 24, borderRadius: 12, border: '1px solid var(--agro-border)' }}>
    <Typography.Title level={3}>Вітаємо в AgroTech!</Typography.Title>
    <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Щоб розпочати, додайте перші дані:</Text>
    <Space direction="vertical" size={12} style={{ width: 280 }}>
      <Button block type="primary" onClick={() => navigate('/fields')}>1. Додати поля</Button>
      <Button block onClick={() => navigate('/machinery')}>2. Додати техніку</Button>
      <Button block onClick={() => navigate('/warehouses/items')}>3. Створити склад</Button>
      <Button block onClick={() => navigate('/operations')}>4. Записати операцію</Button>
    </Space>
    <Divider />
    <Button onClick={async () => {
      try {
        const { default: apiClient } = await import('../api/axios');
        await apiClient.post('/api/tenants/seed-demo');
        message.success('Демо-дані завантажено!');
        setTimeout(() => window.location.reload(), 500);
      } catch { message.error('Помилка'); }
    }}>Завантажити демо-дані</Button>
  </Card>
)}
```

i18n: uk.ts dashboard: `welcome: 'Вітаємо в AgroTech!'`

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: dashboard onboarding wizard with demo data"
git push origin main
```
