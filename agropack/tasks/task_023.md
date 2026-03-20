# Таск 023: Feature: real-time GPS tracking via SignalR

## Опис
FleetMap.tsx — підключитись до FleetHub через signalR. Маркери на Leaflet з швидкістю. Іконки техніки.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: real-time GPS tracking via SignalR"
git push origin main
```
