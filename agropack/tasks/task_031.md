# Таск 031: Feature: marginality dashboard

## Опис
GetMarginalityQuery — факт/план/прогноз по культурах. Frontend картки з Statistic.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: marginality dashboard"
git push origin main
```
