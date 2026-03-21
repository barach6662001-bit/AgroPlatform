# Таск 033: Feature: revenue analytics

## Опис
Графіки доходів: PieChart по культурах, LineChart тренд, BarChart по покупцях.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: revenue analytics"
git push origin main
```
