# Таск 049: Feature: marketing landing page

## Опис
HTML сторінка: hero, features, pricing Starter/Pro/Enterprise, free trial CTA.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: marketing landing page"
git push origin main
```
