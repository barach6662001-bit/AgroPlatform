# Таск 025: Feature: geofence alerts

## Опис
В GPS webhook — PostGIS ST_Contains перевірка. Якщо техніка за межами поля → сповіщення.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: geofence alerts"
git push origin main
```
