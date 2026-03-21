# Таск 017: UX: skeleton loaders on all tables

## Файл: `frontend/src/components/TableSkeleton.tsx` (створити)

```tsx
import { Skeleton, Space } from 'antd';

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }} size={8}>
      <Skeleton.Input active block style={{ height: 36, borderRadius: 6 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton.Input key={i} active block style={{ height: 44, borderRadius: 4 }} />
      ))}
    </Space>
  );
}
```

На всіх сторінках з таблицями замінити `{loading ? <Spin /> : <Table>}` на `{loading ? <TableSkeleton /> : <Table>}`.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: skeleton loaders on all tables"
git push origin main
```
