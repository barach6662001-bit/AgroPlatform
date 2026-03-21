# Таск 040: Feature: mobile field inspection

## Опис
Entity FieldInspection: FieldId, EmployeeId, Lat, Lon, PhotoUrl, Notes. API + камера + GPS.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: mobile field inspection"
git push origin main
```
