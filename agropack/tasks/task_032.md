# Таск 032: Feature: cost analytics charts

## Опис
Endpoint GET /api/economics/cost-analytics. Frontend — PieChart по категоріях, BarChart по місяцях. Recharts.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: cost analytics charts"
git push origin main
```
