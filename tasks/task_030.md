# Таск 030: Feature: sales module

## Опис
Entity Sale: BuyerName, CropType, QuantityTons, PricePerTon, TotalAmount, SaleDate. CRUD API + frontend Продажі в Фінансах.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: sales module"
git push origin main
```
