# Таск 022: Feature: NDVI timeline slider

## Опис
В FieldNdviTab — Slider по датах знімків. GET /api/satellite/dates/{fieldId}. При зміні дати — оновити зображення.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: NDVI timeline slider"
git push origin main
```
