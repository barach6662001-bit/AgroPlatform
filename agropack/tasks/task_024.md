# Таск 024: Feature: GPS tracker webhook Teltonika

## Опис
Створити GpsController.cs POST /api/gps/webhook/teltonika. Парсити IMEI → Machine. Зберігати GpsTrack. Broadcast FleetHub. Додати ImeiNumber до Machine + міграція.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: GPS tracker webhook Teltonika"
git push origin main
```
