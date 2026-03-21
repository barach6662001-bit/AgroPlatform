# Таск 042: Feature: offline mode

## Опис
IndexedDB кешування. Sync queue при відновленні мережі.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: offline mode"
git push origin main
```
