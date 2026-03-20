# Таск 014: UX: responsive tablet layout

## Файл: `frontend/src/index.css`

Додати:
```css
@media (max-width: 1024px) {
  .ant-table { font-size: 13px; }
  .ant-card { padding: 12px; }
  .ant-modal { max-width: 95vw !important; }
}
@media (max-width: 768px) {
  .ant-table-wrapper { overflow-x: auto; }
}
```

## Файл: `frontend/src/components/Layout/Sidebar.tsx`

Додати auto-collapse:
```tsx
const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
useEffect(() => {
  const h = () => setCollapsed(window.innerWidth < 1024);
  window.addEventListener('resize', h);
  return () => window.removeEventListener('resize', h);
}, []);
```

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "UX: responsive tablet layout"
git push origin main
```
