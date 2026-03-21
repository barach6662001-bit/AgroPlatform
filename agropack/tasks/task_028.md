# Таск 028: Feature: variable rate application maps

## Опис
На основі NDVI + SoilAnalysis → карта з нормою внесення по зонах. Export CSV для бортового комп'ютера.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: variable rate application maps"
git push origin main
```
