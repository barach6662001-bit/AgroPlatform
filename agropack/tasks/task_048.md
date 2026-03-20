# Таск 048: Feature: 1C export

## Опис
Експорт витрат, зарплат, складу в XML/CSV для 1С імпорту.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: 1C export"
git push origin main
```
