# Таск 026: Feature: field management zones

## Опис
Нова entity FieldZone: Id, FieldId, Name, Geometry, SoilType, Notes. CRUD API + frontend малювання зон на карті.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: field management zones"
git push origin main
```
