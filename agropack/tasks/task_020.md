# Таск 020: Feature: Sentinel-2 NDVI satellite imagery

## Опис
Створити SatelliteController.cs з GET /api/satellite/ndvi/{fieldId}?date= — проксі до Sentinel Hub WMS. Створити frontend/src/pages/Fields/FieldNdviTab.tsx — вкладка NDVI з Leaflet ImageOverlay. Додати вкладку в FieldDetail.tsx. Легенда: червоний=стрес, жовтий=помірно, зелений=здорово.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: Sentinel-2 NDVI satellite imagery"
git push origin main
```
