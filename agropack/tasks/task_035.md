# Таск 035: Feature: season comparison

## Опис
Endpoint GET /api/economics/season-comparison?years=. Таблиця і графік по роках.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: season comparison"
git push origin main
```
