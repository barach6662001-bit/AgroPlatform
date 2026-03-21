# Таск 039: Feature: PWA setup

## Опис
manifest.json, service worker, link в index.html, реєстрація SW в main.tsx.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: PWA setup"
git push origin main
```
