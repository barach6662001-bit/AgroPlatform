# Таск 043: Feature: push notifications FCM

## Опис
Firebase Cloud Messaging. При створенні Notification → push. Запит дозволу.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: push notifications FCM"
git push origin main
```
