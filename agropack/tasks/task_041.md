# Таск 041: Feature: QR fuel issue

## Опис
QR для машин. На Паливній — скан → авто-вибір машини → форма видачі.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: QR fuel issue"
git push origin main
```
