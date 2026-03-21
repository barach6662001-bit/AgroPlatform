# Таск 047: Feature: public API with keys

## Опис
API key auth. Rate limiting. Webhooks. Swagger docs.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: public API with keys"
git push origin main
```
