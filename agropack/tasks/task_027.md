# Таск 027: Feature: soil analysis module

## Опис
Нова entity SoilAnalysis: Id, FieldId, ZoneId?, SampleDate, pH, N, P, K, Humus, Notes. CRUD API + вкладка Ґрунт на полі.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: soil analysis module"
git push origin main
```
