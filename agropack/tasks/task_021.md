# Таск 021: Feature: NDVI problem zone detection

## Опис
В FieldNdviTab — canvas pixel analysis. NDVI < 0.3 → червоний overlay. Показати alert. Створити Notification на бекенді.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: NDVI problem zone detection"
git push origin main
```
