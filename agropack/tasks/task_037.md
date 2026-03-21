# Таск 037: Feature: crop rotation advisor

## Опис
Історія культур 3-5 років. Підсвічення монокультури. Рекомендації сівозміни.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: crop rotation advisor"
git push origin main
```
