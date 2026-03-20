# Таск 046: Feature: multi-farm support

## Опис
Dropdown тенантів в header. API для списку тенантів юзера. Перемикання X-Tenant-Id.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: multi-farm support"
git push origin main
```
