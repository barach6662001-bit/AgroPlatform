# Таск 029: Feature: cadastral vector tiles on map

## Опис
Frontend FieldMap — toggle Кадастр. PBF тайли через /api/cadastre/tile. maplibre-gl plugin.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: cadastral vector tiles on map"
git push origin main
```
