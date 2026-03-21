# Таск 044: Feature: role-permission matrix

## Опис
Entity Permission: RoleId, Module, CanRead/Create/Update/Delete. API + frontend чекбокси.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: role-permission matrix"
git push origin main
```
