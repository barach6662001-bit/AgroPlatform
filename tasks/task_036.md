# Таск 036: Feature: break-even calculator

## Опис
InputNumber ціна/т → таблиця полів з мін. врожайністю. costs / (price * area).

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: break-even calculator"
git push origin main
```
